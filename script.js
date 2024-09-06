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

        if (file.name.endsWith('.csv')) {
            var lines = data.split('\n');
            var headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
            lines.slice(1).forEach(function(line) {
                var values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
                if (values.length > 1) {
                    var indexObj = { name: values[0] };
                    headers.forEach((header, i) => {
                        if (i === 0 || header.toLowerCase() === 'count') return; // skip name and count field
                        if (values[i]) {
                            indexObj[header] = isNaN(values[i]) ? values[i] : parseInt(values[i], 10);
                        }
                    });
                    // Add form input values if they exist and are not already in the CSV
                    if (datatype && !indexObj.datatype) indexObj.datatype = datatype;
                    if (maxDataSizeMB && !indexObj.maxDataSizeMB) indexObj.maxDataSizeMB = parseInt(maxDataSizeMB, 10);
                    if (searchableDays && !indexObj.searchableDays) indexObj.searchableDays = parseInt(searchableDays, 10);
                    if (splunkArchivalRetentionDays && !indexObj.splunkArchivalRetentionDays) indexObj.splunkArchivalRetentionDays = parseInt(splunkArchivalRetentionDays, 10);
                    if (selfStorageBucketPath && !indexObj.selfStorageBucketPath) indexObj.selfStorageBucketPath = selfStorageBucketPath;
                    indexes.push(indexObj);
                }
            });
        } else {
            var uint8Array = new Uint8Array(data);
            var workbook = XLSX.read(uint8Array, { type: 'array' });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];
            var json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            var headers = json[0];

            indexes = json.slice(1).map(row => {
                var indexObj = { name: row[0] };
                headers.forEach((header, i) => {
                    if (i === 0 || header.toLowerCase() === 'count') return; // skip name and count field
                    if (row[i]) {
                        indexObj[header] = isNaN(row[i]) ? row[i] : parseInt(row[i], 10);
                    }
                });
                // Add form input values if they exist and are not already in the Excel
                if (datatype && !indexObj.datatype) indexObj.datatype = datatype;
                if (maxDataSizeMB && !indexObj.maxDataSizeMB) indexObj.maxDataSizeMB = parseInt(maxDataSizeMB, 10);
                if (searchableDays && !indexObj.searchableDays) indexObj.searchableDays = parseInt(searchableDays, 10);
                if (splunkArchivalRetentionDays && !indexObj.splunkArchivalRetentionDays) indexObj.splunkArchivalRetentionDays = parseInt(splunkArchivalRetentionDays, 10);
                if (selfStorageBucketPath && !indexObj.selfStorageBucketPath) indexObj.selfStorageBucketPath = selfStorageBucketPath;
                return indexObj;
            });
        }

        // Wrap indexes inside { "indexes": [] }
        var output = {
            indexes: indexes
        };

        document.getElementById('output').textContent = JSON.stringify(output, null, 2);
        document.getElementById('download-section').style.display = 'block';

        document.getElementById('preview-button').addEventListener('click', function() {
            var filename = document.getElementById('filename').value || 'output';
            document.getElementById('filename-preview').textContent = 'Filename: ' + filename + '.json';
            document.getElementById('download-button').style.display = 'block';
        });

        document.getElementById('download-button').addEventListener('click', function() {
            var filename = document.getElementById('filename').value || 'output';
            var blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename + '.json';
            link.click();
        });
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
});
