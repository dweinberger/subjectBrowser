<?php
error_log("-------------------FETCH ITEMS WITHIN A CLASS AND CHECK IF BOOKS--------------------");
// give it a class and it finds the subclasses, and marks how many items are in each
ini_set('display_errors','On');
error_reporting(E_ALL);


$classterm = $_REQUEST['classterm'];
error_log("Original Classterm: $classterm ");
//$classterm="Science";

function getClassName($singleclass_ornate){
   $p = strrpos($singleclass_ornate,"%%",0);
  // print_r($p . "<br>");
   $singleclass = $singleclass_ornate;
   $singleclass = substr($singleclass_ornate,0,$p); // drop the call number range
   //  print_r($singleclass . "<br>");
   $p = strripos($singleclass,"%%",-1); // get the last %%, which will be before the class name
  // print_r($p . "<br>");
  if ($p !== false) {
  	error_log("No '--' in singleclass:" .$singleclass);
   	$singleclass = substr($singleclass,$p + 2); // drop the call number range
   }
  error_log("SingleClass: " . $singleclass);
  
  return $singleclass;
}


//---------- GET THE CHILDREN OF THE REQUESTED CLASS
// http://stackoverflow.com/questions/12916539/simplest-php-example-for-retrieving-user-timeline-with-twitter-api-version-1-1
// Create curl resource 
$ch = curl_init(); 
// Set url 
curl_setopt($ch, CURLOPT_URL, "http://librarycloud.law.harvard.edu/v1/api/lc_class/?filter=parent_class:" . $classterm);
// Return the transfer as a string 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
// $classlist contains the output string 
$classlist = curl_exec($ch); 
// Close curl resource to free up system resources 
//error_log("Got classlist: $classlist");

//------------ GOES THROUGH THE CHILDREN, extracting subclass name, looking it up in item API to see how many books are in it
if ($classlist){
   // look up the class names to see if there are books within it
   error_log("in classlist");
   $array = json_decode($classlist);
   // create container for all the class data
   $classarray = array();
   
   if ($array->num_found > 0){
   		$number_of_children = count($array->docs[0]->child_classes);
   		}
   	else {
   		$number_of_children = -1;
   	}
   	error_log("Number of children: " . $number_of_children);
   
   for ($i=0;$i < $number_of_children; $i++){
  // for ($i=0;$i < 2; $i++){
  //foreach ($array["docs"][0]["child_classes"] as $child_class){
   	//print_r("<br>Number:" . $i . "EMD<br>" );
   	//for ($j=0;$j < count($classes->child_classes); $j++) {
   		$child_class = $array->docs[0]->child_classes[$i];
   		
   		$classwithspaces = getClassName($child_class);
   		//print_r("<p>DONECLASS: " . $class);
   		$class = str_replace(" ","%20",$classwithspaces);
   		//print_r("<li>" . $class);
   		
		//print_r("<hr>" . $count);
		//print_r("<li>" . $barray["num_found"]); //$count . $class);
   		//WORKS http://hlslwebtest.law.harvard.edu/v1/api/item/?filter=collection:hollis_catalog&filter=loc_call_num_subject:Science
   		// WORKS: http://hlslwebtest.law.harvard.edu/v1/api/item/?filter=collection:hollis_catalog&filter=loc_call_num_subject:Science%20--%20Biology%20(General)%20--%20Evolution%20--%20Coevolution
   		// add child and count to array
   		//$childclases
   		$oneclassarray = array();
   		$oneclassarray["class"] = $classwithspaces;
   		//$oneclassarray["bookcount"] = $count;
   		array_push($classarray,$oneclassarray);
   		error_log($i . " child");
   }
	

}



echo json_encode($classarray);

?>