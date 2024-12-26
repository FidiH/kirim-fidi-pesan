// tampilkan media jika ada
media.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    // ambil tipe file
    let tipeFile = file.type.split("/")[0];
    // buat pembaca
    let pembaca = new FileReader();

    pembaca.onload = function (e) {
      if (tipeFile === "image") {
        pratinjau.innerHTML = `<img src="${e.target.result}" height="30%"> <button onClick="hapusGambar()" id="tombolHapusGambar">Hapus Gambar</button>`;
        tombolMedia.innerText = "Ganti";
      } else if (tipeFile === "video") {
        pratinjau.innerHTML = `<video src="${e.target.result}" controls></video>`;
        tombolMedia.innerText = "Ganti";
      } else {
        pratinjau.innerHTML =
          "<h4>Hanya mendukung formar gambar dan vidio</h4>";
      }
    };
    pembaca.readAsDataURL(file);
  }
});

// auto height textarea
inputPesan.addEventListener("input", function () {
  this.style.height = "auto"; // Reset tinggi untuk menghitung ulang
  const newHeight = this.scrollHeight;
  this.style.height = newHeight > 100 ? "100px" : `${newHeight}px`; // Batasi hingga 100px

  hitungHuruf.innerHTML = inputPesan.value.length;
});

// kirim data
inputForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // tampung form
  const dataUser = new FormData(inputForm);

  // tambahkan tanggal ke form
  dataUser.append("tanggal", new Date().toLocaleString());

  // kirim data
  try {
    // coba kirim data ilikenop
    const kirimData = await fetch("/ponekili", {
      method: "POST",
      body: dataUser,
    });

    // cek balasan server
    const balasan = await kirimData.json();

    //kondisii input, cek lewat server
    if (!balasan.status) {
      notif.innerHTML = `<p>${balasan.pesan}</p>`;
      return;
    } else {
      disbaleTombol("mengirim");
      notif.innerHTML = `<p>${balasan.pesan}</p>`;
    }
    // hilangka notif selama 2detik
    setTimeout(() => {
      notif.innerHTML = ``;
    }, 1000);

    // ksongkan input
    kosongkanInput();
    // disbale tombol
    disbaleTombol("…");
  } catch (err) {
    notif.innerHTML = `<p>${err}</p>`;
  }
});
function kosongkanInput() {
  pratinjau.innerHTML = "";
  inputForm.reset();
  hitungHuruf.innerText = 0;
}

inputNama.addEventListener("input", () => {
  if (!inputNama.value.trim(" ").length <= 0) {
    tombolKirim.innerText = "Kirim";
    tombolKirim.removeAttribute("disabled");
  } else {
    disbaleTombol("…");
  }
});

function disbaleTombol(pesan) {
  tombolKirim.setAttribute("disabled", "");
  tombolKirim.innerText = pesan;
}

function hapusGambar() {
  media.value = "";
  pratinjau.innerHTML = "";
}

hapusForm.addEventListener("click", () => {
  pratinjau.innerHTML = "";
  hitungHuruf.innerText = "0";
  tombolMedia.innerText = "Media";
  disbaleTombol("…");
});

{
  // ubah secara global
  if (!inputNama.value.trim(" ").length <= 0) {
    tombolKirim.innerText = "Kirim";
    tombolKirim.removeAttribute("disabled");
  } else {
    disbaleTombol("…");
  }
}
