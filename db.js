import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'simpel.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function convert(sql) {
  return sql.replace(/\$(\d+)/g, '?');
}

export function queryOne(sql, params = []) {
  return db.prepare(convert(sql)).get(...params) || null;
}

export function queryAll(sql, params = []) {
  return db.prepare(convert(sql)).all(...params);
}

export function run(sql, params = []) {
  db.prepare(convert(sql)).run(...params);
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      nip TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('pegawai','satops','admin')),
      divisi TEXT DEFAULT ''
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      jenis TEXT NOT NULL CHECK(jenis IN ('pagi','sore')),
      tanggal TEXT NOT NULL,
      pembina TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      nip TEXT NOT NULL REFERENCES users(nip),
      scan_time TEXT DEFAULT CURRENT_TIMESTAMP,
      gps_lat REAL,
      gps_lng REAL,
      gps_ok INTEGER DEFAULT 0,
      scanned_by TEXT,
      status TEXT DEFAULT 'hadir',
      keterangan TEXT DEFAULT ''
    )
  `);
}

function seedIfEmpty() {
  const row = db.prepare("SELECT 1 FROM users LIMIT 1").get();
  if (row) { console.log('Database already seeded.'); return; }

  const hash = bcrypt.hashSync('password123', 10);
  const insert = db.prepare("INSERT INTO users (nip, name, password, role, divisi) VALUES (?, ?, ?, ?, ?)");

  const divisiPegawai = [
    { nip: '198605042007011002', name: 'FAJAR TEGUH WIBOWO, A.Md.IP, S.Sos, M.A', divisi: 'Pimpinan' },
    { nip: '198210192007031002', name: 'HERWAN SYAHPUTRA, S.Sos', divisi: 'Pimpinan' },
    { nip: '199803102021001001', name: 'RAMADINA UMARO, S.Tr.Pas', divisi: 'Pimpinan' },
    { nip: '199005072010121001', name: 'SAID FAHZIYADI ALWI, S.H., M.H.', divisi: 'Pimpinan' },
    { nip: '199412132021001001', name: 'RICKY KURNIADY, S.Tr.Pas.', divisi: 'Pimpinan' },
    { nip: '198211162008012009', name: 'RIKA NOFIAR', divisi: 'Pengelolaan' },
    { nip: '198912142017121006', name: 'AKMAL ARAFAT', divisi: 'Pengelolaan' },
    { nip: '199110062017121001', name: 'HANDY WIJAYA', divisi: 'Pengelolaan' },
    { nip: '199208232017121003', name: 'FELIX ASNAWI', divisi: 'Pengelolaan' },
    { nip: '199504122017121002', name: 'ASYAMI FARY PRATAMA', divisi: 'Pengelolaan' },
    { nip: '199504272017121006', name: 'EKA AFRI PRASETIAWAN', divisi: 'Pengelolaan' },
    { nip: '199505152017122003', name: 'DHEA FIFTEN MANDEYKA', divisi: 'Pengelolaan' },
    { nip: '199901032017121001', name: 'DANI RAMADHANI', divisi: 'Pengelolaan' },
    { nip: '200003042022031001', name: 'AMSAL PURBA', divisi: 'Pengelolaan' },
    { nip: '200009172022031001', name: 'TIMOTHY RICHARDO H', divisi: 'Pengelolaan' },
    { nip: '200107222022031001', name: 'AVIV RIZKI AL FARIS', divisi: 'Pengelolaan' },
    { nip: '200208032022031001', name: 'NOVAL GUSTIAN', divisi: 'Pengelolaan' },
    { nip: '198812282008012001', name: 'DESI ARMIDA, S.H.', divisi: 'KPR' },
    { nip: '198811142008011001', name: 'YUDHA NUGROHO, S.H.', divisi: 'KPR' },
    { nip: '198804022009121007', name: 'RONALD.E, S.H.', divisi: 'KPR' },
    { nip: '198902102008011001', name: 'M.JEFRI', divisi: 'KPR' },
    { nip: '198705182008011001', name: 'FRANKI AJI KURNIAWAN', divisi: 'KPR' },
    { nip: '198601292007032001', name: 'FEBI DWI KUSYANTI', divisi: 'KPR' },
    { nip: '199002072017121002', name: 'FERNANDO SINURAT, S.AP.', divisi: 'KPR' },
    { nip: '198908272009011001', name: 'AHAD RIADI', divisi: 'KPR' },
    { nip: '199411222017122005', name: 'UMMI THAYYIBAH', divisi: 'KPR' },
    { nip: '199502142017121004', name: 'FEBRIAN RAMONDA', divisi: 'KPR' },
    { nip: '199702272017121003', name: 'ARI HAJAR HIDAYAT', divisi: 'KPR' },
    { nip: '199709042017121003', name: 'HARIMURTI', divisi: 'KPR' },
    { nip: '199805152017121001', name: 'AL FATAHFISABILILLAH', divisi: 'KPR' },
    { nip: '199807142017121003', name: 'DWI ALIF SUWITO', divisi: 'KPR' },
    { nip: '199712102017121003', name: 'HERDIANSYAH TRI ATMOKO', divisi: 'KPR' },
    { nip: '199009052025062008', name: 'ELFINA MAGDALENI', divisi: 'KPR' },
    { nip: '199212192025062002', name: 'CHRISTIANI MARBUN', divisi: 'KPR' },
    { nip: '199904122025062010', name: 'NUNIK INDARWATI', divisi: 'KPR' },
    { nip: '198705082010121003', name: 'RIFKI INDRA ANTONI SIRAIT, S.H.', divisi: 'Peltah' },
    { nip: '198112082009122002', name: 'drg.PUTRI ANDAMDEWI', divisi: 'Peltah' },
    { nip: '199208172025061007', name: 'dr. ALEX SYAPUTRA SIHALOHO', divisi: 'Peltah' },
    { nip: '199404152017122002', name: 'Ns.INDAH ANGELICA.S, S.Kep', divisi: 'Peltah' },
    { nip: '198701082007032001', name: 'NILA USMAWATI', divisi: 'Peltah' },
    { nip: '198605202008011003', name: 'ARIF SANJAYA', divisi: 'Peltah' },
    { nip: '198309242009122001', name: 'ELNICK DRIA', divisi: 'Peltah' },
    { nip: '198912282012121002', name: 'ROYDES PUTRA JAYA PANE', divisi: 'Peltah' },
    { nip: '199105262022032001', name: 'RISHA MEIRIN, AMd.Kep', divisi: 'Peltah' },
    { nip: '199512182017121004', name: 'HARI SAHPUTRA', divisi: 'Peltah' },
    { nip: '199706062017121002', name: 'HAYYU NUR MUHAMMAD', divisi: 'Peltah' },
    { nip: '199706242017121004', name: 'AMIRUL HADI', divisi: 'Peltah' },
    { nip: '199703162017121002', name: 'BOBI SUPRIYANTO', divisi: 'Peltah' },
    { nip: '200012122022031002', name: 'HARIS BUDIMAN', divisi: 'Peltah' },
    { nip: '200211172022032001', name: 'CHINTYA ROMAITO SIAHAAN', divisi: 'Peltah' },
    { nip: '200212292022031002', name: 'PATAR GULTOM', divisi: 'Peltah' },
    { nip: '199308022012121001', name: 'SAMSUL BAHRI, S.E.', divisi: 'Bimgiat' },
    { nip: '198411272007031001', name: 'RIO SAPUTRA', divisi: 'Bimgiat' },
    { nip: '198106122008011012', name: 'KUDUS SUSANTO', divisi: 'Bimgiat' },
    { nip: '198805042008011003', name: 'ADI SAPUTRA', divisi: 'Bimgiat' },
    { nip: '199011262010121002', name: 'ANDY YONHENDRA SAPUTRA', divisi: 'Bimgiat' },
    { nip: '198611292009122007', name: 'ERVINORA', divisi: 'Bimgiat' },
    { nip: '199611112017121006', name: 'EVANDER NICHOLAS WOLLAH', divisi: 'Bimgiat' },
  ];

  const insertMany = db.transaction((items, role) => {
    for (const p of items) {
      insert.run(p.nip, p.name, hash, role, p.divisi);
    }
  });

  insertMany(divisiPegawai, 'pegawai');

  const satopsUsers = [
    { nip: '199707262017121002', name: 'RENALDY WILLY SETYAJI', divisi: 'Satops Patnal' },
    { nip: '200605182025062003', name: 'NABILA HYFA', divisi: 'Satops Patnal' },
  ];
  insertMany(satopsUsers, 'satops');

  insert.run('199003102011031001', 'Admin SIMPEL', hash, 'admin', '');

  console.log('Database seeded: 58 pegawai, 2 satops, 1 admin');
}

export function initDB() {
  createTables();
  seedIfEmpty();
  console.log('Database ready');
}
