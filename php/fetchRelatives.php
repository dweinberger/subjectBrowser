<?php
error_log("-------------------FETCH RELATIVES--------------------");
ini_set('display_errors','On');
error_reporting(E_ALL);


$searchterm = $_POST['searchterm'];
$relative = $_POST['relative'];
error_log("Searchterm: .$searchterm relative: $relative");

// replace spaces with pluses
$searchstring = str_replace(" ","%20",$searchterm);
//$searchstring = str_replace("'","\'",$searchterm);

// works http://librarycloud.law.harvard.edu/v1/api/lc_class/?filter=parent_class:Geography.%20Anthropology.%20Recreation%20--%20Recreation.%20Leisure
//  nopehttp://librarycloud.law.harvard.edu/v1/api/lc_class/?filter=parent_class:Geography.%20Anthropology.%20Recreation%20--%20Recreation.%20Leisure%20--%20Sports%20--%20Ball%20games%20--%20Baseball
if ($relative == "CHILDREN"){
	$data = "filter=parent_class:" . $searchstring;
	$uri =  "http://librarycloud.law.harvard.edu/v1/api/lc_class/?" . $data;
}
if (($relative == "SIBLINGS") || ($relative == "AUNTS")){
	// if it's Aunts, then the searchstring is the actual parent
	// of the current item's class. (parent = last delimiter was lopped off
	// in the client
	$data = "filter=parent_class:" . $searchstring;
	$uri =  "http://librarycloud.law.harvard.edu/v1/api/lc_class/?" . $data;
}


error_log("QUERY: $uri");
   
$file = file_get_contents($uri);
die($file);

echo $file;

?>