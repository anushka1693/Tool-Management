function loadExcel(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(evt) {
    const data = new Uint8Array(evt.target.result);
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    document.getElementById("questions").innerHTML =
      json.map(r => `
      <div class="border p-2 mb-2">
      <b>${r[0]}</b>
      <input class="border w-full mt-1">
      <input type="file">
      </div>
      `).join("");
  };

  reader.readAsArrayBuffer(file);
}
