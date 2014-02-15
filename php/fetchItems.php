<?php
error_log("-------------------FETCH ITEMS--------------------");
// fetches by keyword and/or by class

ini_set('display_errors','On');
error_reporting(E_ALL);


$classterm = $_POST['classterm'];
$keyword = $_POST['keyword'];
$startingPoint = $_POST['startingPoint'];
$library = $_POST['library'];

$sclassterm = str_replace(" ","%20",$classterm);
$skeyword = str_replace(" ","+",$keyword);
//debug
//$classterm = "Science%20--%20Biology%20(General)%20--%20Cytology%20--%20General%20works,%20treatises,%20and%20textbooks%20--%201970-";

error_log("classterm: .$classterm keyword . $keyword startingPoinit: $startingPoint");

// build query
// if no keyword, just get the items in the class
if ($keyword == "[[NO SEARCHTERM]]"){
	$data = "filter=loc_call_num_subject:" . $sclassterm;
}
// if no class, just get keyword items
if ($classterm == "[[NO CLASS]]"){
	$data = "filter=keyword:" . $skeyword;
}

//if class and keyword
if (($classterm != "[[NO CLASS]]") && ($keyword != "[[NO SEARCHTERM]]")){
	$data =  "filter=keyword:" . $skeyword . "&filter=loc_call_num_subject:" . $sclassterm;
}

$data = $data . "&filter=collection:hollis_catalog&start=" . $startingPoint;

if (($library != "NONE") && ($library != "MORE")){
	$data = $data . "&filter=holding_libs:" . $library;
}

error_log("DATA: " . $data);

// items in a subject
//http://hlslwebtest.law.harvard.edu/v1/api/item/?filter=loc_call_num_subject:Science%20--%20Biology%20(General)%20--%20Cytology%20--%20General%20works,%20treatises,%20and%20textbooks%20--%201970-
// items in a subject + keyword
//http://librarycloud.law.harvard.edu/v1/api/lc_class/?filter=child_classes_keyword:Science%20--%20Biology%20(General)%20--%20Evolution&filter=keyword:hybrid


// doit
$uri =  "http://librarycloud.harvard.edu/v1/api/item/?" . $data;
error_log("QUERY: $uri");



   
$file = file_get_contents($uri);
die($file);

echo $file;

?>