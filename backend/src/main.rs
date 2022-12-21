use actix_web::rt;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use indexmap::{self, IndexMap};
use json::object;
use once_cell::sync::OnceCell;
use rusqlite::Connection;
use std::collections::HashMap;
use std::sync::RwLock;

type TransID = i64;
type State<'a> = RwLock<HashMap<TransID, Transaction<'a>>>;

#[post("/getfirst/{TransID}")]
async fn get_first<'a>(req: web::Path<TransID>, data: web::Data<State<'static>>) -> impl Responder {
    //if data.is_poisoned() {
    //data.clear_poison();
    //}
    let id = req.into_inner();
    let mut tr = Transaction::new(IMGS.get().unwrap());

    let response = object! {
        "img1" : tr.get_next().unwrap(), // can't fail
        "img2" : tr.get_next().unwrap()  // can't fail
    };
    data.write()
        .expect("THREAD HOLDING DICTIONARY LOCK PANICKED")
        .insert(id, tr);

    // remove unused transactions. > 20 mins is excessive.
    // This is still vulnerable to many kinds of DoS, what should I do?
    rt::spawn(async move {
        rt::time::sleep(std::time::Duration::from_secs(20 * 60)).await;
        data.write().unwrap().remove(&id);
    });
    HttpResponse::Ok().body(response.to_string())
}

#[post("/getnext/{TransID}/{index}")]
async fn get_next(
    req: web::Path<(TransID, u16)>,
    data: web::Data<State<'static>>,
) -> impl Responder {
    //if data.is_poisoned() {
    //data.clear_poison();
    //}

    let mut dict = data
        .write()
        .expect("THREAD HOLDING DICTIONARY LOCK PANICKED");

    let body;
    match dict.get_mut(&req.0) {
        None => return HttpResponse::BadRequest().body("Transaction ID not found"),
        Some(tr) => {
            tr.update(req.1.into());
            match tr.get_next() {
                None => {
                    tr.end();
                    dict.remove(&req.0);
                    body = object! {"done": true}
                }
                Some(obj) => body = object! {"img": obj.to_string()},
            }
        }
    }

    HttpResponse::Ok().body(body.to_string())
}

static IMGS: OnceCell<IndexMap<i32, String>> = OnceCell::new();
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let con = Connection::open("./data.db").expect("couldn't connect to db");
    IMGS.set(Transaction::fetch_imgs(&con)).unwrap();

    println!("Server running in localhost in port 8081");

    let register: State = RwLock::new(HashMap::new());
    let state = web::Data::new(register);
    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .service(get_first)
            .service(get_next)
    })
    .bind(("localhost", 8081))?
    .run()
    .await
}
//CONSTS
const LIMIT: usize = 25;
type history_t  = u32;

struct Transaction<'a> {
    used_keys: Vec<i32>,
    index: u8,
    history: history_t, //bitfield
    keys: &'a IndexMap<i32, String>,
}

impl<'a> Transaction<'a> {
    fn fetch_imgs(con: &Connection) -> IndexMap<i32, String> {
        let mut x = con.prepare("select rowid, * from imgs").unwrap();
        let ret = x
            .query_map([], |x| {
                Ok((x.get::<usize, i32>(0).unwrap() - 1, x.get(1).unwrap()))
            })
            .unwrap()
            .into_iter()
            .flatten()
            .collect::<IndexMap<i32, String>>();
        if ret.len() < LIMIT {
            panic!("There aren't enough imgs!")
        };
        ret
    }

    fn new(keys: &'a IndexMap<i32, String>) -> Self {
        Self {
            used_keys: Vec::with_capacity(LIMIT),
            index: 0,
            history: 0,
            keys,
        }
    }
    /// Get a new unused key.
    ///
    /// This assumes that keys is way bigger than LIMIT so that the time complexity approaches O(1)
    fn get_next(&mut self) -> Option<&'a str> {
        if self.index == LIMIT as u8 {
            return None;
        }
        loop {
            let i = rand::random::<usize>() % self.keys.len();
            if let Some(rand_key) = self.keys.get_index(i) {
                if !self.used_keys.contains(rand_key.0) {
                    self.used_keys.push(*rand_key.0);
                    return Some(rand_key.1);
                }
            }
        }
    }
    fn update(&mut self, position: history_t) {
        dbg!(self.index);
        self.history |= position << self.index;
        self.index += 1;
    }
    fn end(&self) {
        dbg!(self.history, &self.used_keys);
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use crate::Transaction;
    use indexmap::IndexMap;
    use rusqlite::Connection;

    fn make_harness() -> IndexMap<i32, String> {
        let con = Connection::open_in_memory().unwrap();
        con.execute_batch( // TODO add more!
            "
        CREATE TABLE imgs(url text);
        INSERT INTO imgs VALUES ('banana');
        INSERT INTO imgs VALUES ('mango');
        INSERT INTO imgs VALUES ('kiwi');
        INSERT INTO imgs VALUES ('3');
        INSERT INTO imgs VALUES ('4');
        INSERT INTO imgs VALUES ('5');
        INSERT INTO imgs VALUES ('6');
        INSERT INTO imgs VALUES ('7');
        INSERT INTO imgs VALUES ('8');
        INSERT INTO imgs VALUES ('9');
        INSERT INTO imgs VALUES ('10');
        INSERT INTO imgs VALUES ('11');
        INSERT INTO imgs VALUES ('12');
        INSERT INTO imgs VALUES ('13');
        INSERT INTO imgs VALUES ('14');
        INSERT INTO imgs VALUES ('15');
        INSERT INTO imgs VALUES ('16');
        INSERT INTO imgs VALUES ('17');
        INSERT INTO imgs VALUES ('18');
        ",
        )
        .unwrap();
        Transaction::fetch_imgs(&con)
    }

    #[test]
    fn imgs_are_retrieved_from_db() {
        let imgs = make_harness();
        assert_eq!(imgs.get_index(0).unwrap(), (&0, &"banana".to_string()));
        assert_eq!(imgs.get_index(1).unwrap(), (&1, &"mango".to_string()));
        assert_eq!(imgs.get_index(2).unwrap(), (&2, &"kiwi".to_string()));
    }
    #[test]
    fn transaction_is_unique_and_ends_with_none() {
        let map = make_harness();

        let mut t = Transaction::new(&map);
        let mut unique: HashSet<&str> = HashSet::new();

        for _ in 0..crate::LIMIT {
            let next = t.get_next().unwrap();
            assert!(unique.insert(next), "Value should be unique and not panic");
        }
        assert!(t.get_next().is_none(), "Transaction is full!");
    }
}
