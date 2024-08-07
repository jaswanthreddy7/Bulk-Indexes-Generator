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
                        if (i === 0) return; // skip name
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
                    if (i === 0) return; // skip name
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

        document.getElementById('output').textContent = JSON.stringify(indexes, null, 2);
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
});
