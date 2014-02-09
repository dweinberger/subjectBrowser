/*
Browse by Library of Congress Subject

By a non-developer attached to the Harvard Library Innovation Lab.

API Examples:

Item query:
http://librarycloud.harvard.edu/v1/api/item/?filter=title_keyword:origin%20of%20species

Run lc_class keyword query against all child classes with that value (there will always only ever be a single class): 
http://hlslwebtest.law.harvard.edu/v1/api/lc_class/?filter=child_classes_keyword:Science%20--%20Biology%20(General)%20--%20Evolution

To go from subject class to books in that class:
http://librarycloud.harvard.edu/v1/api/item/?filter=loc_call_num_subject:Science%20--%20Biology%20(General)%20--%20Evolution

*/


function init(){
	// the enter key presses the search button
	$("#searchbox").keydown(function(event){
      if(event.keyCode == 13){
    	event.preventDefault();
       fetchItems('','SEARCHBTN');
       
    }
  });
 	
}

function tryOut(s){
	// click on a link to try out the site
	
	// enter the term into the searchbox
	$("#searchbox").val(s);
	// do it
	fetchItems("","SEARCHBTN");
}

function callAPI(dataobj){
	   var respo; 
	   var searchterm="";
	   $("#loading").show();
 	// call the php that gets the data from LibraryCloud
	// keep this non-async so the value of respo doesn't get wiped out
	// keyword, classterm are the two parameters
	
	//var datastring = encodeURI("searchterm=" + searcher);
	//var datastring: dataobj,
	$.ajax({
  		type: "POST",
 		data: dataobj,
 		url: './php/fetchItems.php',
 		async: false,
 		success: function(r,mode){
                respo = r;
                $("#loading").hide();
            }
  });
  
  return respo
}

function getDisplayName(s,maxlength){
	// shortens name, adds ellipsis
	if (s.length > maxlength){
		s = s.substr(0,maxlength) + "...";
	}
	return s
}

function createNames(s){
	names["html"] = escapeHtmlEntities(s);
	names["displayPathShortest"] =  getDisplayName(names["html"],30);
	names["displayPathShort"] =  getDisplayName(names["html"],60);
	names["lastName"] = lastBranchOnly(s);
	names["lastNameHtml"] = escapeHtmlEntities(names["lastName"]);
	var php = s.replace(/\s/g, '%20');
	php = php.subj2 = subj2.replace(/'/g, "\\'");
	php = php.replace(/"/g,'"\\"');
	names["php"] = php;
	
}
 
function setSearchStatus(searchterm,classterm,offset){
	$("#searchstatus").attr("searchterm",searchterm); 
	$("#searchstatus").attr("sartingoffset",offset); 
	if (classterm == "[[NO CLASS]]"){
		classterm = "";
	}
	if (classterm == "[[NO CLASS]]"){
		classterm = "";
	}
	$("#searchstatus").attr("classterm",classterm); 
	$("#searchstatus").attr("startingoffset",offset); 
	// update displays
	var displaysearchterm = getDisplayName(searchterm, 25);
	var displayclassterm = getDisplayName(classterm,60);
	$("#currentsearchdiv").text(displaysearchterm); // update display of searchterm
	$("#currentsearchdiv").attr("title",searchterm);
}

function fetchItemsFromSearchbox(searchterm,startingOffset){
		
		// display the search term
		var displaysearchterm = getDisplayName(searchterm,20);
		$("#currentsearchdiv").text(displaysearchterm); 
		$("#currentsearchdiv").attr("title",searchterm);
		// do the API call
		data = {keyword : searchterm, classterm:"", startingPoint: startingOffset};
		resp = callAPI(data);
		
		return resp;
}

function fetchItemsFromLeaf(classterm,searchterm,offset){
		
		// is the "use search term" box checked?
		// if from Next, it may have a search term
		// If from a Leaf, searchterm will be ""
		if (searchterm == "") {
			if ($("#searchcheckbox").is(":checked") == true){
				var searchterm = $("#searchbox").val();
			}
		}
		else {
			var searchterm = "";
		}
		// set display
		var displaysearchterm = getDisplayName(searchterm,20);
		var displayclassname = getDisplayName(classterm,60);
		var displaytext = displayclassname;
		if (searchterm != "") {
			displaytext = displaytext.substr(0,15) + " [" + displaysearchterm.substr(0,15) + "]";
		}
		else {
			displaytext="Class: " + getDisplayName(classterm, 25);
		}
		$("#currentsearchdiv").text(displaytext); 
		$("#currentsearchdiv").attr("title","CLASS: " + classterm + " TERM: " + searchterm); // set new searchterm
		$("#currentclassdiv").text(displayclassname);
		$("#currentclassdiv").attr("title",classterm);
		
		//Do the API call
		data = {keyword : searchterm, classterm:classterm, startingPoint:offset};
		resp = callAPI(data);
		return resp;
}


function fetchItems(searchterm,whichbtn){
	// gets list of books from Hollis
	var data,classterm="", resp, nextbtn,currentStartingIndex;
	
	//-- from the Search button
	if (whichbtn == "SEARCHBTN"){
		if (searchterm == ""){ // searchterm is blank from dynamic button
			searchterm = $("#searchbox").val();
		}
		resp = fetchItemsFromSearchbox(searchterm,0);
		// set up for Next button
		currentStartingIndex=0;
	}
	
	//-- Start from leaf
	if (whichbtn == "LEAF"){
		resp = fetchItemsFromLeaf(searchterm,"",0);
		// set up for Next button
		currentStartingIndex=0;
	}
	
	//-- Start from Next button
	if (whichbtn == "NEXTBTN"){
		// get the button and its attributes
		nextbtn = document.getElementById("nextbtn"); 
		searchterm = $(nextbtn).attr("searchterm");
		classname =  $(nextbtn).attr("classname");
		// is it a searchterm only?
		if ((searchterm.length > 0) && (classname.length == 0)){
			// put searchterm into searchbox
			$("#searchbox").val(searchterm);
			// get the current beginning offset
			currentStartingIndex = $(nextbtn).attr("currentStartingIndex");
			// increase it by 25
			currentStartingIndex = parseInt(currentStartingIndex) + 25;
			// do the api thang
			resp = fetchItemsFromSearchbox(searchterm,currentStartingIndex);
			
		}
		// is it a classname?
		if ((searchterm.length > 0) && (classname.length > 0)){
			resp = fetchItemsFromLeaf(classname,searchterm,currentStartingIndex)
		}
	}
	
	// turn into array
	var barray = JSON.parse(resp);
	
	// ---- DISPLAY the items with a link if they have loc_call_num_subject
	var eclass,itemdiv,itemspan,auntspan,kidspan,sibspan,oneresult, creators;
	var resultsdiv= $("#itemsearchreturnslist")[0];
	// make sure it's visible
	resultsdiv.style.display="block";
	resultsdiv.innerHTML="";
	for (var i = 0; i < barray.docs.length; i++){
		itemdiv = document.createElement("div");
		itemdiv.setAttribute("class","resultdiv");
		itemdiv.setAttribute("id","result" + i);
		
		itemspan = document.createElement("span");
		itemdiv.appendChild(itemspan);
		// is there a loc call number?
		oneresult = barray.docs[i];
		if ((oneresult.loc_call_num_subject !== undefined) && (oneresult.loc_call_num_subject !== null)){
			// display the subject
			var subjspan = document.createElement("span");
			// embed the data
			itemspan.setAttribute("class","locclass");
			itemdiv.setAttribute("lcclass", oneresult.loc_call_num_subject);	
			//var arraysubj = [oneresult.loc_call_num_subject];
			//buttonize the subject class string
			var linkedstring = buttonizeSubjectClassString(oneresult.loc_call_num_subject,"result" + i);
			itemdiv.appendChild(linkedstring);	
			//itemdiv.innerHTML = itemdiv.innerHTML + linkedstring;
			// create the buttons
			//createButtons(itemdiv,oneresult.loc_call_num_subject );
		}
		else {
			itemspan.setAttribute("class","nolocclass");
		}
		// add authors
		if (oneresult.creator !== undefined){
		creators = oneresult.creator.join();
		}
		else {creators = "no author listed";}
		// truncate authors if too long
		if (creators.length > 30) {
			creators = creators.substr(0,30) + "...";
			}
		itemspan.innerHTML = "<span class='bktitle'>" + oneresult.title + "</span>. <span class='bkauthor'>" + creators + "</span>";	
		// create hover text
		var hover= oneresult.title + " by " + creators + "<br>Publisher: " +oneresult.publisher;
		hover = hover +   "<br>Date: " + oneresult.pub_date_numeric + "<br>Pages: " + oneresult.pages_numeric + "<br>StackScore: " + oneresult.shelfrank;
		itemspan.setAttribute("title", hover);
		
		// create stacklife link
		var stacklifeid = oneresult.id;
		var stacklifeshortname = oneresult.title_link_friendly;
		if ((stacklifeid != undefined) && (stacklifeshortname != undefined)){
			var stacklifeurl = "http://stacklife.harvard.edu/item/" + stacklifeshortname + "/" + stacklifeid;
			var stacklifelink = document.createElement("a");
			stacklifelink.setAttribute("class","stacklifelink");
			stacklifelink.setAttribute("href", stacklifeurl);
			stacktext = document.createElement("img");
			stacktext.setAttribute("src","./images/out.jpg");
			stacktext.setAttribute("width","12px");
			stacktext.setAttribute("height","12px");
			stacklifelink.appendChild(stacktext);
			itemspan.appendChild(stacklifelink);
		}
		resultsdiv.appendChild(itemdiv);
		
	}

	// -- add the Next button
	if ((parseInt(barray.start) + 25)  < barray.num_found){
		var nextbtnp = document.createElement("p");
		var nextbtn = document.createElement("span");
		nextbtn.setAttribute("class","nextbtn");
	
		var nextstart = parseInt(currentStartingIndex) + 25;
		var nextend = parseInt(nextstart) + parseInt(25) ;
		var numberLeft = barray.num_found - barray.start;
		if (numberLeft > 25) {numberLeft = 25;}
		var btntext = document.createTextNode("Next " + numberLeft + " (" + nextstart + " - " +  nextend + " of " + barray.num_found + ")");
		nextbtn.setAttribute("onclick","fetchItems('" + searchterm + "', 'NEXTBTN')");
		nextbtn.setAttribute("id","nextbtn");
		nextbtn.setAttribute("classname",classterm);
		nextbtn.setAttribute("searchterm",searchterm);
		nextbtn.setAttribute("currentStartingIndex",currentStartingIndex);
		nextbtn.appendChild(btntext);
		nextbtnp.appendChild(nextbtn);
	
		resultsdiv.appendChild(nextbtnp);
	}
	
	// qtip to style the title hover popups
    $('[title]').qtip({
      style: { classes: 'qtip-cream qtip-rounded' }
    });

}


function buttonizeSubjectClassString(s,id){

	// turn one -- two -- three into a set of buttons
	// we want:
	// <span class="subjsentence">
	//	  <span class="arrow_box" onclick='fetchRelatives("resultsid1","CHILDREN","science")>Science</span>
	//	  <span class="arrow_box" onclick='fetchRelatives("resultsid1","CHILDREN","science -- biology")>Biology</span>
	// </span>
	var subjs = s[0].split(" -- "); // change to item api
	//var subjs = s.split(" -- "); // turn it into an array
	// each should do a query on itself and everything to its right
	var subjsentence = document.createElement("span");
	subjsentence.setAttribute("class","subjsentence");
	var linkedphrase, subjectString;
	for (var i = 0; i < subjs.length; i++){
		var arrow_box = document.createElement("span");
		subjectString="";
		// concatenate all to the left
		for (var j = 0; j <= i; j++){
			subjectString = subjectString + subjs[j];
			if (j !== i) {
				subjectString = subjectString + " -- ";
			}
		}
		//subjectString = encodeURIComponent(subjectString);
		subjectString = subjectString.replace(/'/g, "\\'");
		arrow_box.setAttribute("onclick","fetchAndCheckChildClasses('" + id + "','CHILDREN','" + subjectString + "')");
		arrow_box.innerHTML = subjs[i] + " ";
		if (i < subjs.length -1){
		
		}
		arrow_box.setAttribute("class","arrow_box");
		subjsentence.appendChild(arrow_box);
	}

	
	return subjsentence;
	
}

function greaterThanDisplay(s){
	s = s.replace(/ -- /g,">");
	return s
}

// ------ Fetch Relatives And Check for Items
function fetchAndCheckChildClasses(id,which,subj){
	// get the specified relatives
	
	// get the result containing this button
	var itemdiv = document.getElementById(id);
	if (id.indexOf("result") > -1) { // if  clicked within results list
		
	 	// display current class
	 	// get the lcclass attr of the parent
		var resultsubj = subj;
	}
	else { // clicked within tree
		var resultsubj = getEnglishNameFromRaw(subj);
		
	}
	$("#currentclassdiv").text(getDisplayName(resultsubj,60));
	
  	
  	  // remove current selection if clicked within the book list
  	  if (id !== "NONE"){
		  $('.locclass_selected').removeClass('locclass_selected').addClass('locclass');
		   // mark the current item clicked on
		 var itemdiv = document.getElementById(id);
		 // itemdiv.parentNode.setAttribute("class", "locclass_selected");
		  $(itemdiv).addClass('locclass_selected');
  	  }
  	 
	   var subj2 =  subj.replace(/\s/g, '%20');
	    subj2 = subj2.replace(/'/g, "\\'");
	   // is it root
	   if (subj == "root"){
	   		subj2 = "*";
	   	}
	   
	   
 	// call the php that gets the data from LibraryCloud
	// keep this non-async so the value of respo doesn't get wiped out
	
	
	$("#loading").show();
	var respo;
	$.ajax({
  		type: "POST",
  		data: {classterm  : subj2},
 		 url: './php/fetchAndCheckChildren.php',
 		//  async: false,
 		 success: function(r,mode){
                respo = r;
                $("#loading").hide();
                showRelations(itemdiv,respo,which, subj2);
                
            },
        error: function(r,mode){
        	$("#loading").hide();
        }
  });
  
}




function getEnglishName(s){
  // extracts readable class name from full ugly string with %%
 s = s.replace(/%%/g, ' -- ');
 s = removeTail(s);
 s = lastBranchOnly(s);
 return s;
 
}

function buildTree(json,which,lcclass){
// create a tree, using global subjtree
// thanks http://www.jstree.com/
	
	var treediv = document.getElementById("treediv");
	// clear it
	//$(treediv).fadeOut(500);
	  treediv.innerHTML="";
  	// insert spaces back into lcclass
  	lcclass = lcclass.replace(/%20/g, ' ');
  	//var mainname = getEnglishNameFromRaw(lcclass);
  	// get the json
	var classarray = JSON.parse(json);
	//var tempset = barray.docs[0].child_classes;
  	 // ------ get children 
  
	var i,li, kid, kidRawName,kidItemCount,childs = new Array;


    
    // -- build the trunk that shows all the parent classes - top line of the list
    var trunk = document.createElement("p"); // create the parent il
    trunk.setAttribute("class","parentitem");
    trunk.setAttribute("id","listparent");// add the root button
    treediv.appendChild(trunk); // append item    
    // Create the root button that will show the very top level
    var rootbtn = document.createElement("span"); // buttonizeSubjectClassString("root",'NONE');
    rootbtn.setAttribute("title","Root of all subject classes");
    var rootimg = document.createElement("img");
    rootimg.setAttribute("src","images/up.png");
    rootbtn.appendChild(rootimg);
    rootbtn.setAttribute("onclick","fetchAndCheckChildClasses('NONE','CHILDREN','')");
    trunk.appendChild(rootbtn);
    // linkify the string
    if (lcclass != ""){
    var linkspan = document.createElement("span");
    var lcclassWithoutTail = removeTail(lcclass); // do no link the final element
   if (lcclassWithoutTail != lcclass){
   		arrayclasswithouttail = [lcclassWithoutTail]; // buttonize expects array
   		linkspan.appendChild(buttonizeSubjectClassString(arrayclasswithouttail, 'NONE'));
   }
   // create  final member: doesn't get children but can get leaves
    var unlinkedspan = document.createElement("span");
    textnode = document.createTextNode(lastBranchOnly(lcclass));
    unlinkedspan.appendChild(textnode);
    unlinkedspan.setAttribute("class","lastelement");
    // embed the leaves icon into this final element
    var unlinkedleavesimg = document.createElement("img");
    unlinkedleavesimg.setAttribute("src","images/leaves.png");
    var unlinkedleavesspan = document.createElement("span");
    unlinkedleavesspan.setAttribute("title","Display the items directly under this class");
    unlinkedleavesspan.setAttribute("onclick","fetchItems('" + lcclass + "','LEAF')");
    unlinkedleavesspan.appendChild(unlinkedleavesimg);
    unlinkedspan.appendChild(unlinkedleavesspan);
    
    if (unlinkedspan.innerHTML != lcclass){
    	linkspan.appendChild(unlinkedspan);
    }
    trunk.appendChild(linkspan);
    }
  
    var branchesdiv = document.createElement("div"); // ul for the children
    trunk.appendChild(branchesdiv); // append the children's ul   
	
	// -- make each child into a div
	var displaychildname="", kidClass="",kidItemCount=0;
	for (i=0; i < classarray.length; i++){
		kid = classarray[i]; // get one entry
		kidClass = kid["class"];
		names = createNames(kidClass);
		kidItemCount = kid["bookcount"];
		branch = document.createElement("div");
		branch.setAttribute("id","treelist" + i);
		branch.setAttribute("class","branch");
		var displaychildnameraw = lastBranchOnly(kidClass);
		//var displaychildname = displaychildnameraw.replace(/'/g, "&#39;");
		//displaychildname = displaychildname.replace(/"/g, "&#34;");
		//if (displaychildname.length > 30){
		//	displaychildname = displaychildname.substr(0,30) + "...";
		//	}
		displaychildname = names["displayPathShortest"]; // 30 character abbreviation of full path
		// link the subj class so that it gets its children
		linkspan = document.createElement("span");
   		linkspan.setAttribute("class","arrow_box");
   		var escapedkidclass = kidClass.replace(/'/g, "&#39;");
   		escapedkidclass = escapedkidclass.replace(/"/g, "&#34;");
   		var kidslcclass = lcclass + " -- " + escapedkidclass; // add the child to the subj
   		var fetchrel = "fetchAndCheckChildClasses('" + ("treelist" + i) + "','CHILDREN','" + names[" + "')";
		linkspan.setAttribute("onclick",fetchrel);
		linkspan.setAttribute("title",escapedkidclass);
		linkspan.innerHTML = displaychildname;

		// attach book button (leaves)
		showEmpties = true;
		if ((showEmpties == true) || (kidItemCount > 0)){
			var bookspan = createBookButton(kidClass,kidItemCount );
			// create container span so that clicks work for both lcclass and book icon
			var contspan = document.createElement("span");
		
			branch.appendChild(linkspan);
			branch.appendChild(bookspan);
			// append to the li
			//branch.appendChild(contspan);
			treediv.appendChild(branch);  // attach it
				
	   	}
   }
   	  	 // qtip to style the title hover popups
    $('[title]').qtip({
      style: { classes: 'qtip-cream qtip-rounded' }
    });
	
}


function createBookButton(subj,count){
	// Create book icon that fetches book for that class
	// called when creating the tree
				
	kidspan= document.createElement("span");
    kidspan.setAttribute("class","bookspan");
    if (count > 0){
    	kidspan.setAttribute("onclick","fetchItems('" + subj +"','LEAF')");
    	var leafimg = "images/leaves.png";
    }
    else {
    	var leafimg = "images/grayleaves.png";
    }
    var img = document.createElement("img");
    img.setAttribute("src",leafimg);
    img.setAttribute("height","18px");
    img.setAttribute("width","18px");
    img.setAttribute("vertical-align","bottom");
    img.setAttribute("class","leaves");
    img.setAttribute("title","List all books in this class");
    kidspan.appendChild(img);
    var ctspan = document.createElement("span");
    ctspan.setAttribute("class","bookcountclass");
    ctspan.innerHTML=count;
    kidspan.appendChild(ctspan);

   return kidspan;
		
}


function showRelations(item,json,which,lcclass){
	// animate it a copy
	
	
	if (item != null) {
		//var cloned = $(item).clone()[0];
	   //$(cloned).animate({ right: '120px' }, 4000 );
	
		var classname = item.getAttribute("class");
		if (classname.indexOf("jstree") > -1) { // if it's a branch in the tree
		
		var floatspan = document.createElement("span");
		floatspan.setAttribute("class","floater");
		// $(floatspan).css({ position: "absolute"});
		floatspan.innerHTML =  item.textContent ;
		//var offset = $(item).offset();
		//$(floatspan).offset({ top: offset.top, left: offset.left})
		//floatspan.offsetTop = item.offsetTop;
		//floatspan.offsetLeft= item.offsetLeft;
		//document.getElementById("treecont").appendChild(floatspan);
		$(floatspan).position({
    		my:        "left top",
    		at:        "left top",
    		of:        "#treediv",
   		 collision: "fit"
		})
		
		//$("#itemsearchreturnslist").append(floatspan);
		// $(floatspan).css({ position: "relative","z-index":100000});
		$(floatspan).animate({right: "-=200px"}, 4000);
	}
	}
     buildTree(json,which,lcclass);
     return 
}

function textOnly(s){
	// remove everything except the text version of the class
	s = s.substr(0, s.lastIndexOf("%") -1); // remove tail
	var p = s.lastIndexOf("%"); // remove head
	s = s.substr(p+1);
	return s;

}

function lastBranchOnly(s){
	// returns the last branch
	var p = s.lastIndexOf(" -- ");
	if (p > 0){
		s = s.substr(p + 4);
	}
	return s;
}

function removeTail(s){
   // remove last --
   var news=s;
   var lastdash = s.lastIndexOf(" -- ");
   if (lastdash > 0){
   		news = s.substr(0,lastdash);
   }
   return news;
}
 
function getEnglishNameFromRaw(s){
	// takes %%QE1232%%SUBJECT-LINE%%454453453 and returns SUBJECT_LINE
	var p = s.lastIndexOf("%%"); // if no %%
	if (p == -1){
		return s
	}
	s = s.substr(0,p);
	p = s.lastIndexOf("%%");
	s = s.substr(p + 2);
	return s;
}

function toggleExplanation(){
 // show and hide the explanation
 var div = document.getElementById("explans");
 if (div.style.display=="none") {
     $(div).show("slow");
     }
     else {
     $(div).hide("slow");
     }
}

//-------------------- UNUSED

// ------ Fetch Relatives
function fetchRelatives_unused(id,which,subj){
	// get the specified relatives
		
	// get the result containing this button
	if (id !== "NONE"){
		var itemdiv = document.getElementById(id);
	 // display current class
	 // get the lcclass attr of the parent
		var resultsubj = itemdiv.getAttribute("lcclass");
	}
	else {
		var resultsubj = getEnglishNameFromRaw(subj);
		subj = resultsubj;
	}
	$("#currentclassdiv").text(resultsubj);
	
	
  	   // if aunts, we're looking for the siblings of the current lcclass
  	   // so remove the last delimiter and basically do a siblings search
  	   if (which == "AUNTS"){
  	   	subj = removeTail(subj);
  	   	subj = removeTail(subj);
  	   }
  	   
  	
  	  // remove current selection if clicked within the book list
  	  if (id !== "NONE"){
		  $('.locclass_selected').removeClass('locclass_selected').addClass('locclass');
		   // mark the current item clicked on
		 var itemdiv = document.getElementById(id);
		 // itemdiv.parentNode.setAttribute("class", "locclass_selected");
		  $(itemdiv).addClass('locclass_selected');
  	  }
  	 
	   var subj2 =  subj.replace(/\s/g, '%20');
 	// call the php that gets the data from LibraryCloud
	// keep this non-async so the value of respo doesn't get wiped out

	var respo;
	$.ajax({
  		type: "POST",
  		data: {searchterm : subj2, relative : which},
 		 url: './php/fetchRelatives.php',
 		 async: false,
 		 success: function(r,mode){
                respo = r;
                showRelations(itemdiv,respo,which, subj2);
            }
  });
  
}
