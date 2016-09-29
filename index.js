var express = require('express');
var app = express();

// stumbling blocks:
// modern browsers automatically reject query param tokens in the DOM
// solution: ?xss=1
//
// https://google.com will not work because of x-allow-origin
// solution: use a page which allows iframes

// a query like:
// <iframe style="width: 100%; height: 100%; position: absolute; top: 0; left: 0" src="http://www.w3schools.com"></iframe>
// works

// with xss:
// <script>alert('hi')</script>
// works

app.get('/', function (req, res) {
    var search = req.query.q || '';
    var xss = 'xss' in req.query;
    var noscript = 'noscript' in req.query;

    if (xss) res.append('X-XSS-Protection', 0);

    if (noscript && search.indexOf('script') !== -1) {
        search = '<b>no script tags allowed</b>';
    }

    res.send(`
        <html>
            <head>
            </head>
            <body>
                <div class="container">
                    <h1>The Most Useful Site</h1>

                    <form action="/">
                        <label for="q">Search:</label>
                        <input id="q" type="text" name="q"/>
                        ${xss ? '<input type="hidden" name="xss" value="true"/>' : ''}
                        ${noscript ? '<input type="hidden" name="noscript" value="true"/>' : ''}

                        <input type="submit"/>
                    </form>

                    Your search for ${search} did not produce any results.

                    <script>
                        // repopulate the search box (for ease of interviewing)
                        onload = function () {
                            var queryText = location.search.substring(1);
                            var query = {};

                            queryText.split('&').forEach(function (keyValue) {
                                var parts = keyValue.split('=');

                                query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || 'true');
                            });

                            document.getElementById('q').value = query.q || '';
                        };
                    </script>
                </div>
            </body>
        </html>
    `)
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log('listening on', port);
});
