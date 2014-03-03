<?php
error_log("-------------------FETCH NUMBER OF HOLDINGS IN MULTIPLE LIBS-------------------");
// give it a class and it finds the subclasses, and marks how many items are in each
ini_set('display_errors','On');
error_reporting(E_ALL);
//echo("<h2>In FetchGraph Data</h1>");


$class = $_REQUEST['class'];

$uri = "http://librarycloud.harvard.edu/v1/api/item/?filter=collection:hollis_catalog&filter=loc_call_num_subject:" . $class . "&facet=holding_libs";

   
$file = file_get_contents($uri);


//echo $file;

echo  (json_encode($file));


?>