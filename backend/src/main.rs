use indexmap::{self, IndexMap};
use rusqlite::{Connection, Result};

//CONSTS
const LIMIT: usize = 10;

fn fetch_imgs(con: &Connection) -> IndexMap<i32, String> {
    let mut x = con.prepare("select * from imgs").unwrap();
    x.query_map([], |x| Ok((x.get(0).unwrap(), x.get(1).unwrap())))
        .unwrap()
        .into_iter()
        .flatten()
        .collect::<IndexMap<i32, String>>()
}

fn main() -> Result<()> {
    let con = Connection::open("./data.db")?;
    let imgs = fetch_imgs(&con);
    imgs.iter().for_each(|x| {println!("{},{}", x.0, x.1);});
    Ok(())
}
struct Transaction<'a> {
    used_keys: Vec<i32>,
    index: u8,
    history: u16, //bitfield
    keys: &'a IndexMap<i32, String>,
}

impl<'a> Transaction<'a> {
    fn new(keys: &'a IndexMap<i32, String>) -> Transaction {
        Self {
            used_keys: Vec::with_capacity(LIMIT),
            index: 0,
            history: 0,
            keys,
        }
    }
    fn get_next(&self) -> &String {
        loop {
            let i = rand::random::<usize>() % self.keys.len();
            if let Some(rand_key) = self.keys.get_index(i) {
                if self.used_keys.contains(rand_key.0) {
                    return rand_key.1;
                }
            }
        }
    }
}
