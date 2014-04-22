    <?php

    // mysql configuration, for php PDO
    $dsn = 'mysql:dbname=task2;host=127.0.0.1';
    $user = 'root';
    $password = '123';

    // read data from REQUEST and exit on empty string
    $data = $_REQUEST['data'];
    if (!$data) exit();

    $maxResults = intval($_REQUEST['maxResults']);
    if (!$maxResults) $maxResults = 4;

    try {
        $dbh = new PDO($dsn, $user, $password);
    } catch (PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }

    $res = array();

    $data_name_quoted = $dbh->quote("[[:<:]]$data");

    // here need to set fulltext index or use some external tool like Apache Solr for fast search on huge table
    // this solution works slow but fast enought for data provided for this task
    $sql = "SELECT * FROM urls WHERE name REGEXP $data_name_quoted LIMIT $maxResults";

    foreach ($dbh->query($sql) as $row) {
        $res[] = array('url' => $row['url'], 'name' => $row['name']);
    }

    // if we still have limit of records then select by url
    if (count($res) < $maxResults) {
        $data_url_quoted = $dbh->quote("$data%");
        $data_url_http_quoted = $dbh->quote("http://$data%");
        $data_url_http_www_quoted = $dbh->quote("http://www.$data%");
        $maxResults -= count($res);

        // with index on url field this query can use index and works on large table
        $sql = "SELECT * FROM urls WHERE `url` LIKE $data_url_quoted OR `url` LIKE $data_url_http_quoted OR `url` LIKE $data_url_http_www_quoted LIMIT $maxResults";

        foreach ($dbh->query($sql) as $row) {
            $res[] = array('url' => $row['url'], 'name' => $row['url']);
        }
    }

    print json_encode(array('success' => 1, 'data' => $res));