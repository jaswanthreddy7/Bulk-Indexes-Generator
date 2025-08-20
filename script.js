document.getElementById('upload-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];

    var datatype = document.getElementById('datatype').value;
    var maxDataSizeMB = document.getElementById('maxDataSizeMB').value;
    var searchableDays = document.getElementById('searchableDays').value;
    var splunkArchivalRetentionDays = document.getElementById('splunkArchivalRetentionDays').value;
    var selfStorageBucketPath = document.getElementById('selfStorageBucketPath').value;

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    var reader = new FileReader();

    reader.onload = function (e) {
        var data = e.target.result;
        var indexes = [];

        function applyDefaults(indexObj) {
            if (datatype && !indexObj.datatype) indexObj.datatype = datatype;
            if (maxDataSizeMB && !indexObj.maxDataSizeMB) indexObj.maxDataSizeMB = parseInt(maxDataSizeMB, 10);
            if (searchableDays && !indexObj.searchableDays) indexObj.searchableDays = parseInt(searchableDays, 10);
            if (splunkArchivalRetentionDays && !indexObj.splunkArchivalRetentionDays) indexObj.splunkArchivalRetentionDays = parseInt(splunkArchivalRetentionDays, 10);
            if (selfStorageBucketPath && !indexObj.selfStorageBucketPath) indexObj.selfStorageBucketPath = selfStorageBucketPath;
        }

        if (file.name.endsWith('.csv')) {
            var lines = data.split('\n');
            var headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            var nameIndex = headers.findIndex(h => h.toLowerCase() === 'name' || h.toLowerCase() === 'index');
            if (nameIndex === -1) {
                alert("CSV must contain a 'name' or 'index' column.");
                return;
            }

            lines.slice(1).forEach(line => {
                var values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                if (values[nameIndex]) {
                    var indexObj = { name: values[nameIndex] };
                    headers.forEach((header, i) => {
                        if (i === nameIndex || header.toLowerCase() === 'count') return;
                        if (values[i]) indexObj[header] = isNaN(values[i]) ? values[i] : parseInt(values[i], 10);
                    });
                    applyDefaults(indexObj);
                    indexes.push(indexObj);
                }
            });
        } else if (file.name.endsWith('.conf')) {
            var lines = data.split(/\r?\n/);
            let currentIndex = null;
            let currentObj = {};
            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('[') && line.endsWith(']')) {
                    if (currentIndex) {
                        applyDefaults(currentObj);
                        indexes.push(currentObj);
                    }
                    currentIndex = line.slice(1, -1);
                    currentObj = { name: currentIndex };
                } else if (line.includes('=') && currentIndex) {
                    let [key, value] = line.split('=').map(s => s.trim());
                    if (!isNaN(value)) value = parseInt(value, 10);
                    currentObj[key] = value;
                }
            });
            if (currentIndex) {
                applyDefaults(currentObj);
                indexes.push(currentObj);
            }
        } else {
            var uint8Array = new Uint8Array(data);
            var workbook = XLSX.read(uint8Array, { type: 'array' });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];
            var json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            var headers = json[0];
            var nameIndex = headers.findIndex(h => h.toLowerCase() === 'name' || h.toLowerCase() === 'index');
            if (nameIndex === -1) {
                alert("Excel must contain a 'name' or 'index' column.");
                return;
            }

            indexes = json.slice(1).map(row => {
                var indexObj = { name: row[nameIndex] };
                headers.forEach((header, i) => {
                    if (i === nameIndex || header.toLowerCase() === 'count') return;
                    if (row[i]) indexObj[header] = isNaN(row[i]) ? row[i] : parseInt(row[i], 10);
                });
                applyDefaults(indexObj);
                return indexObj;
            });
        }

        var output = { indexes };

        document.getElementById('output').textContent = JSON.stringify(output, null, 2);
        document.getElementById('download-section').style.display = 'block';

        document.getElementById('preview-button').addEventListener('click', function () {
            var filename = document.getElementById('filename').value || 'output';
            document.getElementById('filename-preview').textContent = 'Filename: ' + filename + '.json';
            document.getElementById('download-button').style.display = 'block';
        });

        document.getElementById('download-button').addEventListener('click', function () {
            var filename = document.getElementById('filename').value || 'output';
            var blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename + '.json';
            link.click();
        });
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.conf')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
});
