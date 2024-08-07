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
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[sheetName];
        var json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Convert to JSON format suitable for ACS
        var indexes = json.slice(1).map(row => {
            var index = { name: row[0] };
            if (datatype) index.datatype = datatype;
            if (maxDataSizeMB) index.maxDataSizeMB = parseInt(maxDataSizeMB, 10);
            if (searchableDays) index.searchableDays = parseInt(searchableDays, 10);
            if (splunkArchivalRetentionDays) index.splunkArchivalRetentionDays = parseInt(splunkArchivalRetentionDays, 10);
            if (selfStorageBucketPath) index.selfStorageBucketPath = selfStorageBucketPath;
            return index;
        });

        document.getElementById('output').textContent = JSON.stringify(indexes, null, 2);
    };

    reader.readAsArrayBuffer(file);
});
