/*
By a non-developer attached to the Harvard Library Innovation Lab.

//Example class name:
"Science%20--%20Biology%20(General)%20--%20Evolution%20--%20Coevolution");

*/

// global
var glibarray = new Array();

function init(){
	
	// show the initial tree
	// fetch root of tree
	fetchChildren("");
	// get array of libraries and nicknames
	glibarray = buildLibraryArray(); //glibarray is a global
}

// ----- Fetch info for branches of tree, including # of items in each branch
function fetchChildren(entirePath){
	//entirePath includes the leaf
	$("#loading").show();
	var respo;
	$.ajax({
  		type: "POST",
  		data: {classterm  : entirePath},
 		 url: './php/fetchAndCheckChildren.php',
 		 success: function(r,mode){
                respo = r;
                $("#loading").hide();
                buildTree(r,entirePath);            
            },
        error: function(r,mode){
        	$("#loading").hide();
        }
  });

}

// ----- create a tree, using global subjtree
function buildTree(json,lcclass){
	// thanks http://www.jstree.com/
	
	var treediv = document.getElementById("treediv");
	// clear it
	  treediv.innerHTML="";
  	// insert spaces back into lcclass
  	lcclass = lcclass.replace(/%20/g, ' ');
  	// get the json
	var classarray = JSON.parse(json);
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
   // rootbtn.setAttribute("onclick","fetchAndCheckChildClasses('NONE','')");
   rootbtn.setAttribute("onclick","fetchChildren('')");
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
    unlinkedleavesimg.setAttribute("src","images/graphbtn2-small.png");
    var unlinkedleavesspan = document.createElement("span");
    var anames = createNames(lcclass);
    unlinkedleavesspan.setAttribute("title","Display the items directly under this class");
    unlinkedleavesspan.setAttribute("onclick","fetchGraphData('" + anames['php'] +"')");
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
		var names = createNames(kidClass);
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
   		if (lcclass != ""){
   			var kidslcclass = lcclass + " -- " + escapedkidclass; // add the child to the subj
   		}
   		else {
   			var kidslcclass = escapedkidclass; // add the child to the subj
   		}
   		//var fetchrel = "fetchAndCheckChildClasses('" + ("treelist" + i)  + "','" + names["raw"] + "')";
		var fetchrel = "fetchChildren(" + "'" + names['php'] + "')";
		linkspan.setAttribute("onclick",fetchrel);
		linkspan.setAttribute("title",names["html"]); // hover
		linkspan.innerHTML = names["lastNameHtml"];
	
		treediv.appendChild(branch);  // attach it
				
		// attach book button (were leaves)
		showEmpties = true;
		if ((showEmpties == true) || (kidItemCount > 0)){
			var bookspan = createChartButton(names["raw"],kidItemCount );
			// create container span so that clicks work for both lcclass and book icon
			var contspan = document.createElement("span");
		
			branch.appendChild(linkspan);
			branch.appendChild(bookspan);
			// append to the li
			//branch.appendChild(contspan);
			treediv.appendChild(branch);  // attach it
				
	   	}
   }
}


function buttonizeSubjectClassString(s,id){

	// turn one -- two -- three into a set of buttons
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
		var names = createNames(subjectString)
		arrow_box.setAttribute("onclick","fetchChildren('" +  names['php'] + "')");
		arrow_box.innerHTML = subjs[i] + " ";
		if (i < subjs.length -1){
		
		}
		arrow_box.setAttribute("class","arrow_box");
		subjsentence.appendChild(arrow_box);
	}

	
	return subjsentence;
	
}


function getDisplayName(s,maxlength){
	// shortens name, adds ellipsis
	if (s.length > maxlength){
		s = s.substr(0,maxlength) + "...";
	}
	return s
}

function createNames(s){
	if (s == null){
		return s;
	}
	var names = new Array();
	names["raw"] = s;
	var ss = s;
	names["plain"] = ss.replace(/%20/g, ' ');
	names["plain"] = names["plain"].replace(/\\'/g, "'");
	names["plain"] = names["plain"].replace(/\\"/g, '"');
	names["plainLastName"] = lastBranchOnly(names["plain"]);
	names["html"] = escapeHtmlEntities(s);
	names["lastName"] = lastBranchOnly(s);
	names["lastNameHtml"] = escapeHtmlEntities(names["lastName"]);
	var php = s.replace(/\s/g, '%20');
	php = php.replace(/'/g, "\\'");
	php = php.replace(/"/g,'"\\"');
	names["php"] = php;
	return names;
	
}
 

function fetchGraphData(lcclass){

	$("#loading").show();
	var respo;
	$.ajax({
  		type: "POST",
  		data: {class : lcclass},
 		 url: './php/fetchGraphData.php',
 		 success: function(r,mode){
                respo = r;
                $("#loading").hide();
                buildGraph(r,lcclass);
                
            },
        error: function(r,mode){
        	$("#loading").hide();
        }
  });

}
function buildGraph(resp,branch){
	
	// get the holding libs
	var llarray = JSON.parse(resp);
	var larray = JSON.parse(llarray);
	var facets = larray["facets"];
	var holdinglibs = facets["holding_libs"];
	
	var s1 = []; var ticks=[]; var labels = []; var maxnumb = -1; var numb;
	for (var keyval in holdinglibs){
		libcode = keyval; // the library's code
		numb = holdinglibs[keyval]; // how many copies in this library
		if (numb > maxnumb) { maxnumb = numb;} // get highest number of copies
		// push this number as a single element into a new array
		var onearray = new Array;
		onearray.push(numb);
		s1.push(onearray);
		labels.push({label : glibarray[libcode]});
	}
	
	var names = createNames(branch);

	ticks.length=0;
	ticks.push(names['plain']);

	//Get the context of the canvas element we want to select
	var chartdiv = document.getElementById("chartdiv");
	// get the canvas
	//var canv = document.getElementById("Canvas");
	// delete it
	if (chartdiv) {
    	chartdiv.parentNode.removeChild(chartdiv);
	}
	// create new one
	chartdiv = document.createElement("div");
	chartdiv.setAttribute("id","chartdiv");
	// calc width based on number of items
	// this doesn't work
	var wid = ticks.length * 50;
	if (wid < 200) { wid = "200px";}
	chartdiv.style.width= wid + "px";
	chartdiv.style.height="400px";
	document.getElementById("graphdiv").appendChild(chartdiv);
	
     
    var plot1 = $.jqplot('chartdiv', s1, {
        // The "seriesDefaults" option is an options object that will
        // be applied to all series in the chart.
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            rendererOptions: {fillToZero: true}
        },
        // Custom labels for the series are specified with the "label"
        // option on the series option.  Here a series option object
        // is specified for each series.
        series: labels, // [
//             {label:'Hotel'},
//             {label:'Event Regristration'},
//             {label:'Airfare'}
//         ],
        // Show the legend and put it outside the grid, but inside the
        // plot container, shrinking the grid to accomodate the legend.
        // A value of "outside" would not shrink the grid and allow
        // the legend to overflow the container.
        title: names['plainLastName'],
        legend: {
            show: true,
            placement: 'outsideGrid',
            location: 'ne'
            
        },
        axes: {
            // Use a category axis on the x axis and use our custom ticks.
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticks
            },
            // Pad the y axis just a little so bars can get close to, but
            // not touch, the grid boundaries.  1.2 is the default padding.
            yaxis: {
                pad: 1.05,
                tickOptions: {formatString: ' %d'}
            }
        },
	highlighter:{
        show:true,
        tooltipContentEditor:tooltipContentEditor
    }


	});
        	
}

function tooltipContentEditor(str, seriesIndex, pointIndex, plot) {
    // display series_label, x-axis_tick, y-axis value
    //return plot.series[seriesIndex]["label"] + ", " + plot.data[seriesIndex][pointIndex];
   var fullname = plot.series[seriesIndex]["label"]; // get library nickname
   //var fullname = glibarray[nick];
   var txt = fullname + ": " + plot.data[seriesIndex][pointIndex];
   return txt;
    
    }





function createChartButton(subj,count){
	// Create book icon that creates chart for that class
				
	kidspan= document.createElement("span");
    kidspan.setAttribute("class","bookspan");
    if (count > 0){
    	
    	var leafimg = "images/graphbtn2-small.png";
    }
    else {
    	var leafimg = "images/graphbtn2-small-gray.png";
    }
    var img = document.createElement("img");
    img.setAttribute("src",leafimg);
    img.setAttribute("height","18px");
    img.setAttribute("width","18px");
    img.setAttribute("vertical-align","bottom");
    img.setAttribute("class","leaves");
    img.setAttribute("title","Click to graph libraries holdings in for this category: " + subj);
    kidspan.appendChild(img);
    var ctspan = document.createElement("span");
    ctspan.setAttribute("class","bookcountclass");
    ctspan.innerHTML=count;
    kidspan.appendChild(ctspan);
    var names = createNames(subj)
    if (count > 0){
    	kidspan.setAttribute("onclick","fetchGraphData('" + names['php'] +"')");
   }
   return kidspan;
		
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

function toggleExplanation(){
 // show and hide the explanation
 var div = document.getElementById("explans");
 if (div.style.display=="none") {
     $(div).show("slow");
     $("#explanlabel").text("...Less");
     }
     else {
     $(div).hide("slow");
     $("#explanlabel").text("More...");
     }
}

function rollupdown(e, which){
	var id = "#" + e;
	if (which == "HIDE"){
	$(id).hide(400);
	}
	else {
	$(id).show(400);
	}
}

function buildLibraryArray(){
	var libarray = {
	"AFR":"Afro-American Studies",
	"AJP":"Andover Newton Theol",
	"ANT":"Andover-Harv. Theol",
	"ARG":"Baker Business",
	"ARN":"Baker Business",
	"ART":"Biblioteca Berenson",
	"BAK":"Biological Labs",
	"BER":"Birkhoff Math",
	"BIO":"Blue Hill",
	"BIR":"Boston College",
	"BKO":"Botany Ames Orchid",
	"BLH":"Botany Arboretum",
	"BRM":"Botany Arnold (Cambr.)",
	"BUT":"Botany Econ. Botany",
	"CAB":"Botany Farlow Library",
	"CAR":"Botany Gray Herbarium",
	"CEA":"Botany Gray/Arnold",
	"CEL":"BU School of Theol",
	"CFI":"Busch-Reisinger Mus",
	"CHE":"Cabot Science",
	"CHI":"Carpenter Center",
	"CRL":"Charles Warren Ctr Lib",
	"DAN":"Chemistry",
	"DCJ":"Child Memorial",
	"DDO":"Countway Medicine",
	"DES":"CRL (Ctr for Research Libs)",
	"DEV":"Ctr Eur Studies",
	"DIV":"Ctr Hellen Studies",
	"DOC":"Ctr Intl Affairs",
	"ECB":"Derek Bok Center",
	"EDS":"Development Office",
	"ENV":"Doc Ctr Japan",
	"EUR":"Documents (Lamont)",
	"FAL":"Dumbarton Oaks",
	"FAR":"East Asian Res Ctr",
	"FIG":"EDS/Weston",
	"FOG":"EDS/Weston",
	"FOR":"Environmental Information Ctr",
	"FUN":"Fine Arts",
	"GCT":"Fogg Museum",
	"GDC":"Fung Library",
	"GEO":"Gibb Islamic",
	"GIB":"Gordon-Conwell",
	"GRA":"Grossman",
	"GRO":"Gutman Education",
	"GUT":"Harvard Art Museums",
	"HCR":"Harvard Data Center",
	"HEL":"Harvard Film Archive",
	"HFA":"Harvard Forest",
	"HIL":"Harvard Planning & Real Estate",
	"HIS":"Harvard University Archives",
	"HOU":"Harvard University Library",
	"HPO":"Harvard-Yenching",
	"HSI":"Hilles",
	"HSL":"History Dept",
	"HUA":"History of Science",
	"HUL":"Holy Cross Orthodox",
	"HYL":"Houghton",
	"KIR":"Kennedy Sch of Gov",
	"KSG":"Kirkland House",
	"LAM":"Kummel Geological Sci",
	"LAW":"Lamont",
	"LIN":"Law School",
	"LIT":"Linguistics",
	"MAP":"Littauer",
	"MCK":"Loeb Design",
	"MCZ":"Loeb Music",
	"MED":"Map Coll (Pusey)",
	"MIC":"Master Microforms",
	"MMF":"McKay Applied Sci",
	"MUR":"Medieval Studies Lib",
	"MUS":"Microforms (Lamont)",
	"NEL":"Murray Research Ctr",
	"NET":"Museum Comp Zoology",
	"NMM":"National master micro",
	"OPH":"Near Eastern Lib",
	"ORC":"Networked Resource",
	"PAL":"Networked Resource",
	"PEA":"Ophthalmology",
	"PHI":"Peabody Museum",
	"PHY":"Physics Research",
	"POE":"Poetry Room (Lamont)",
	"PRI":"Primate Center Lib",
	"PSY":"Psychology Research",
	"PUS":"Pusey",
	"QUA":"Quad Library",
	"RCA":"Radcliffe Archives",
	"RRC":"Robbins Philosophy",
	"RUB":"Robinson Celtic",
	"SAN":"Rubel (Fine Arts)",
	"SBC":"Russian Res Ctr",
	"SCC":"Sanskrit Library",
	"SCH":"Schering Health Care",
	"SFL":"Schlesinger",
	"SIA":"Sci & Intl Affairs",
	"SMY":"Sci Instruments",
	"SOC":"Smyth Classical",
	"STA":"Social Rel-Sociol",
	"STJ":"Solidarity Bibl Center",
	"TBC":"St John's Seminary",
	"THE":"Statistics",
	"TOZ":"Straus Conservation",
	"URI":"Theatre Collection",
	"WAM":"Tozzer",
	"WAR":"Ukrainian Res Inst",
	"WEI":"Warren Anatomical",
	"WES":"Weissman Preservation Ctr",
	"WID":"Widener",
	"WOL":"Wolbach Library"
	}
	return libarray;
}

