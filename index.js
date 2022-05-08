const express = require('express');
const { Client } = require("@notionhq/client")

//express setting
const app = express();
const port = process.env.PORT || 3000

//notion setting

app.get('/', (req, res) => {
    res.send('Notion-API');
});


app.get('/book', async(req, res) => {
    notion_token = req.query.TOKEN
    var databaseId = req.query.databaseId;
    if (!notion_token && !databaseId) return res.json({ code: 404 })

    const notion = new Client({
        auth: notion_token,
    })

    const response = await notion.databases.query({
        database_id: databaseId
    });
    arr = response.results.map((v, i) => {
        tmp = {}
        if (v.properties.File.files) tmp.File = v.properties.File.files.map((vv, ii) => {
            return vv.name
        })
        if (v.properties.Name.title) {
            tmpName = v.properties.Name.title
            tmp.Name = tmpName.length > 0 ? tmpName[0].plain_text : ''
        }
        if (v.properties.Page.rich_text) {
            tmpPage = v.properties.Page.rich_text
            tmp.Page = tmpPage.length > 0 ? tmpPage[0].plain_text : '0'
        }
        if (v.properties.Status) {
            tmpStatus = v.properties.Status.select
            tmp.Status = tmpStatus ? tmpStatus.id : '1'
        }
        if (v.properties.File.files) {
            tmpFile = v.properties.File.files
            tmp.File = tmpFile.length > 0 ? tmpFile[0].name : ''
            if (tmpFile.length > 0) {
                if (tmpFile[0].type == "external") {
                    tmp.File = tmpFile[0].name
                } else if (tmpFile[0].type == "file") {
                    try {
                        tmp.File = tmpFile[0].file.url
                    } catch {
                        tmp.File = ''
                    }
                } else {
                    tmp.File = ''
                }
            }
        }
        return tmp
    })
    result = arr.map((v, i) => {
        return `${v.Name} (${v.Page})|X||`
    })
    r = ['task|x|x', ...result]
    results = r.join("\r\n");
    console.log(r)
    res.send(results);
})

app.listen(port, () => console.log(`app listening on port ${port}!`))


function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
