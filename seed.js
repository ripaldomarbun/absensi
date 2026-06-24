import 'dotenv/config';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is required');
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const hash = bcrypt.hashSync('password123', 10);

const divisiPegawai = [
  { nip: '198306122005012004', name: 'Dewi Sartika', divisi: 'KPLP' },
  { nip: '198407182005011005', name: 'Eko Prasetyo', divisi: 'KPLP' },
  { nip: '198508252005012006', name: 'Fitri Handayani', divisi: 'KPLP' },
  { nip: '198609112005011007', name: 'Gunawan Wibisono', divisi: 'KPLP' },
  { nip: '198710302005012008', name: 'Hesti Purnamasari', divisi: 'KPLP' },
  { nip: '198812142005011009', name: 'Irfan Maulana', divisi: 'KPLP' },
  { nip: '198901202005012010', name: 'Juwita Sari', divisi: 'KPLP' },
  { nip: '199002152005011011', name: 'Ketut Adi', divisi: 'KPLP' },
  { nip: '199103182005012012', name: 'Lilis Sulistyowati', divisi: 'KPLP' },
  { nip: '199204222005011013', name: 'Mulyadi', divisi: 'KPLP' },
  { nip: '199305272005012014', name: 'Nia Kurniasih', divisi: 'KPLP' },
  { nip: '199406302005011015', name: 'Oscar Pratama', divisi: 'KPLP' },
  { nip: '199007012010011001', name: 'Rafi Setiawan', divisi: 'Yantah' },
  { nip: '199008022010012002', name: 'Dira Andini', divisi: 'Yantah' },
  { nip: '199009032010011003', name: 'Seno Pratama', divisi: 'Yantah' },
  { nip: '199010042010012004', name: 'Naya Kusuma', divisi: 'Yantah' },
  { nip: '199011052010011005', name: 'Alex Firmansyah', divisi: 'Yantah' },
  { nip: '199012062010012006', name: 'Mega Wati', divisi: 'Yantah' },
  { nip: '199101072010011007', name: 'Dimas Ardiansyah', divisi: 'Yantah' },
  { nip: '199102082010012008', name: 'Rina Marlina', divisi: 'Yantah' },
  { nip: '199103092010011009', name: 'Hendra Gunawan', divisi: 'Yantah' },
  { nip: '199104102010012010', name: 'Yuni Astuti', divisi: 'Yantah' },
  { nip: '199105112010011011', name: 'Adi Saputra', divisi: 'Yantah' },
  { nip: '199106122010012012', name: 'Wulan Dari', divisi: 'Yantah' },
  { nip: '199107132010011013', name: 'Bayu Pratama', divisi: 'Yantah' },
  { nip: '199108142010012014', name: 'Sari Dewi', divisi: 'Yantah' },
  { nip: '199109152010011015', name: 'Cahyo Nugroho', divisi: 'Yantah' },
  { nip: '198001012005011001', name: 'Ahmad Zaini', divisi: 'Binadik' },
  { nip: '198002022005012002', name: 'Bunga Lestari', divisi: 'Binadik' },
  { nip: '198003032005011003', name: 'Citra Permata', divisi: 'Binadik' },
  { nip: '198004042005012004', name: 'Deni Kurniawan', divisi: 'Binadik' },
  { nip: '198005052005011005', name: 'Euis Saroh', divisi: 'Binadik' },
  { nip: '198006062005012006', name: 'Fajar Sidik', divisi: 'Binadik' },
  { nip: '198007072005011007', name: 'Gita Gutawa', divisi: 'Binadik' },
  { nip: '198008082005012008', name: 'Herman Susanto', divisi: 'Binadik' },
  { nip: '198009092005011009', name: 'Indah Permata Sari', divisi: 'Binadik' },
  { nip: '198010102005012010', name: 'Joko Susilo', divisi: 'Binadik' },
  { nip: '198011112005011011', name: 'Kartika Sari', divisi: 'Binadik' },
  { nip: '198012122005012012', name: 'Lukman Hakim', divisi: 'Binadik' },
  { nip: '198101132005011013', name: 'Mira Wahyuni', divisi: 'Binadik' },
  { nip: '198102142005012014', name: 'Nurdin Ali', divisi: 'Binadik' },
  { nip: '198103152005011015', name: 'Oktaviani', divisi: 'Binadik' },
  { nip: '197801012005011001', name: 'Purwanto', divisi: 'TU' },
  { nip: '197802022005012002', name: 'Ratna Dewi', divisi: 'TU' },
  { nip: '197803032005011003', name: 'Slamet Riyadi', divisi: 'TU' },
  { nip: '197804042005012004', name: 'Tuti Handayani', divisi: 'TU' },
  { nip: '197805052005011005', name: 'Ujang Kosasih', divisi: 'TU' },
  { nip: '197806062005012006', name: 'Vera Susanti', divisi: 'TU' },
  { nip: '197807072005011007', name: 'Wawan Setiawan', divisi: 'TU' },
  { nip: '197808082005012008', name: 'Yulia Rahmawati', divisi: 'TU' },
  { nip: '197809092005011009', name: 'Zainal Arifin', divisi: 'TU' },
  { nip: '197810102005012010', name: 'Aisyah Putri', divisi: 'TU' },
  { nip: '197811112005011011', name: 'Budi Santoso', divisi: 'TU' },
  { nip: '197812122005012012', name: 'Cindy Carolina', divisi: 'TU' },
  { nip: '197901132005011013', name: 'Dadang Supriatna', divisi: 'TU' },
  { nip: '197902142005012014', name: 'Elisabeth Sitorus', divisi: 'TU' },
  { nip: '197903152005011015', name: 'Feri Irawan', divisi: 'TU' },
  { nip: '197904162005012016', name: 'Gustina Siregar', divisi: 'TU' },
];

async function seed() {
  console.log('Connecting...');

  for (const p of divisiPegawai) {
    await pool.query(
      "INSERT INTO users (nip, name, password, role, divisi) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (nip) DO NOTHING",
      [p.nip, p.name, hash, 'pegawai', p.divisi]
    );
  }
  console.log('61 pegawai done');

  const satopsUsers = [
    { nip: '198512152005021001', name: 'Seno Pratama', divisi: 'Satops Patnal' },
    { nip: '198612162005021002', name: 'Bambang Hermawan', divisi: 'Satops Patnal' },
    { nip: '198712172005021003', name: 'Citra Lesmana', divisi: 'Satops Patnal' },
    { nip: '198812182005021004', name: 'Dimas Ardiansyah', divisi: 'Satops Patnal' },
    { nip: '198912192005021005', name: 'Eka Fitriani', divisi: 'Satops Patnal' },
  ];
  for (const s of satopsUsers) {
    await pool.query(
      "INSERT INTO users (nip, name, password, role, divisi) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (nip) DO NOTHING",
      [s.nip, s.name, hash, 'satops', s.divisi]
    );
  }
  console.log('5 satops done');

  await pool.query(
    "INSERT INTO users (nip, name, password, role, divisi) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (nip) DO NOTHING",
    ['199003102011031001', 'Admin SIMPEL', hash, 'admin', '']
  );
  console.log('1 admin done');

  console.log('Seed complete!');
  await pool.end();
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
