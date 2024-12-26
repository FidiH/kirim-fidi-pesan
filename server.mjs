// import module
import path from "path";
import { writeFile, readFile } from "fs/promises";
import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import { existsSync, mkdirSync } from "fs";

// config
cloudinary.config({
  cloud_name: "dhuimaaea",
  api_key: "612598959992116",
  api_secret: "xlnhCnQMMVl_XIzF_pH4XKfZTZY",
});

// setup kirim
async function kirimKeCloudinary(file) {
  return new Promise((berhasil, gagal) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // Auto detect apakah gambar atau video
        resource_type: "auto",
        // Lebar target
        width: 300,
        // Tinggi target
        height: 300,
        // Menjaga rasio aspek, menyesuaikan dengan dimensi
        crop: "fit",
        // Kompresi otomatis
        quality: "auto",
        // Format otomatis
        fetch_format: "auto",
      },
      (eror, hasil) => {
        if (eror) {
          gagal(eror);
        } else {
          // ambil url
          berhasil(hasil.secure_url);
        }
      },
    );

    // Mengirim buffer file ke stream Cloudinary
    uploadStream.end(file.buffer);
  });
}

// perbaikan dirname di module
const __dirname = path.resolve();

// setup server
const PORT = 3000;
const app = express();

// setup multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// setup midleware //
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public/")));

// buat file data.json jika tidak ada
const dataPath = path.join(__dirname, "data.json");
if (!existsSync(dataPath)) {
  await writeFile(dataPath, JSON.stringify([]), "utf8");
}

// tampilkan halaman utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// kirim dt
app.get("/fidianakgabut", (req, res) => {
  res.sendFile(path.join(__dirname, "data.json"));
});

// menangani form
app.post("/ponekili", upload.single("media"), async (req, res) => {
  // ambil data yang dikirimkan user
  const { nama, pesan, tanggal } = req.body;
  const file = req.file;

  // cek data datanya
  if (!nama.trim(" ").length) {
    return res.json({
      pesan: "nama kosong",
      status: false,
    });
  } else if (!pesan.trim().length) {
    return res.json({
      pesan: "pesan kosong",
      status: false,
    });
  } else if (nama.trim(" ") <= 25) {
    return res.json({
      pesan: "nama terlalu panjang",
      status: false,
    });
  }

  try {
    // baca file lama
    const dataLama = JSON.parse(await readFile("data.json", "utf8"));

    // cek jika ada file
    if (file) {
      // ambil url file yang di upload
      const mediaUrl = await kirimKeCloudinary(file);
      // masukan url ke file
      dataLama.push({ tanggal, nama, pesan, media: mediaUrl });
    } else {
      // masukan apa adanya
      dataLama.push({ tanggal, nama, pesan, media: null });
    }

    // tulis data baru
    await writeFile("data.json", JSON.stringify(dataLama));

    // respone
    res.status(200).json({ pesan: "Terkirim", status: true });
  } catch (eror) {
    console.error("Error:", eror.message);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat memproses permintaan" });
  }
});

// jalankan server
app.listen(PORT, () => console.log(`PORT : ${PORT}`));
