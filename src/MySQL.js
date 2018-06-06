const jsdom = require('jsdom').JSDOM;
const path = require('path');
const writeJSON = require(__dirname+'/common').writeJSON;



function parsePage(url, cbSuccess) {
    var anchors = [];
    jsdom.fromURL(url).then(dom => {
        var window = dom.window;
        var document = window.document;

        const elements = document.getElementsByClassName('informaltable');
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let doc = { };
            if (element.getElementsByTagName("th")[0].textContent != "Property") {
                continue;
            }

            doc.id = element.parentElement.getElementsByTagName("a")[0].name;

            var tbody = element.getElementsByTagName("tbody")[0];

            var trs = tbody.getElementsByTagName("tr");
            for (let i = 0; i < trs.length; i++) {
                const tr = trs[i];
                var name = tr.firstElementChild.textContent.toLowerCase().trim();
                var value = tr.lastElementChild;
                switch (name) {
                    case 'dynamic':
                        doc.dynamic = value.textContent.toLowerCase().trim() === "yes";
                        break;
                    case 'system variable':
                        doc.name = value.textContent.toLowerCase().trim();
                        break;
                    case 'scope':
                        doc.scope = value.textContent
                        .toLowerCase()
                        .split(",").map(item => item.trim());
                        break;
                    case 'type':
                        doc.type = value.textContent
                        .toLowerCase().trim();
                        break;
                    case 'default value':
                        doc.default = value.textContent
                        .toLowerCase().trim();
                        break;
                    case 'valid values':
                        doc.validValues = [];
                        var codes = value.getElementsByTagName("code");
                        for (let j = 0; j < codes.length; j++) {
                            const code = codes[j];
                            doc.validValues.push(code.textContent);
                        }
                        break;
                    case 'minimum value':
                        if(doc.range == undefined)
                            doc.range = {};
                        doc.range.from = parseFloat(value.textContent.trim());
                        break;
                    case 'maximum value':
                        if(doc.range == undefined)
                            doc.range = {};
                        doc.range.to = parseFloat(value.textContent.trim());
                        break;
                    case 'command-line format':
                        doc.cli = value.textContent.trim();
                        break;
                }
            }
            //console.log(tbody.innerHTML);

            console.log(doc);
            anchors.push(doc);
        }
        cbSuccess(anchors, url);
    });

}

const KB_URL = 'https://dev.mysql.com/doc/refman/8.0/en/';

parsePage(
    //KB_URL+'server-system-variables.html',
    'http://localhost.localdomain/refman-8.0-en.html-chapter/replication.html#replication-options-binary-log',
    (data, url)=> {
        let page = {
            url: url,
            name: 'server-system-variables',
            data: data,
        };
    writeJSON(path.join(__dirname, "../", "data", "mysql-"+page.name+".json"), page);
});
