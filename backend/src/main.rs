use indexmap::{self, IndexMap};
use rusqlite::{Connection, Result};
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

#[get("/")]
async fn render() -> impl Responder { // TODO route to nodejs
    HttpResponse::Ok().body("Hello world!")
}

#[post("/getfirst")]
async fn get_first() -> impl Responder {
    HttpResponse::Ok()
}
#[post("/getnext")]
async fn get_next() -> impl Responder
{
    HttpResponse::Ok()
}

#[actix_web::main]
async fn actix_main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()

        .service(render)
        .service(get_first)
        .service(get_next)
    })
    .bind(("localhost",8080))?
    .run()
    .await
}

//CONSTS
const LIMIT: usize = 10;

fn main() -> Result<()> {
    let con = Connection::open("./data.db")?;
    let imgs = TransactionIndexMap::fetch_imgs(&con);
    imgs.iter().for_each(|x| {
        println!("{},{}", x.0, x.1);
    });
    Ok(())
}

struct TransactionIndexMap<'a> {
    used_keys: Vec<i32>,
    index: u8,
    history: u16, //bitfield
    keys: &'a IndexMap<i32, String>,
}

impl<'a> TransactionIndexMap<'a> {
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
    /// This assumes that keys is way bigger than LIMIT so that the time complexity approaches O(n)
    fn get_next(&mut self) -> Option<&'a str> {
        if self.index == LIMIT as u8 {
            return None;
        }
        self.index += 1;
        loop {
            let i = rand::random::<usize>() % self.keys.len();
            if let Some(rand_key) = self.keys.get_index(i) {
                if !self.used_keys.contains(rand_key.0) {
                    self.used_keys.push(rand_key.0.clone());
                    return Some(rand_key.1);
                }
            }
        }
    }
    fn update(&mut self, _position: bool) {}
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use crate::TransactionIndexMap;
    use indexmap::IndexMap;
    use rusqlite::Connection;

    fn make_harness() -> IndexMap<i32, String> {
        let con = Connection::open_in_memory().unwrap();
        con.execute_batch(
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
        TransactionIndexMap::fetch_imgs(&con)
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

        let mut t = TransactionIndexMap::new(&map);
        let mut unique: HashSet<&str> = HashSet::new();

        for _ in 0..crate::LIMIT {
            let next = t.get_next().unwrap();
            assert!(unique.insert(next), "Value should be unique and not panic");
        }
        assert!(t.get_next().is_none(), "Transaction is full!");
    }
}
