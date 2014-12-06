/*
DICH plugin 
*/

(function ($) {
    
    function init(plot) 
	{
       
  plot.reset_data_axis=function(o)
  {
  
     //return;
     var data=o.data
	 ,options=o.options;
     var f;
     
	 var set_opts=function(oa,ops)
	 {
	    var cc;
	    if(oa&&ops)
		{ 
		     for (var k in oa)
			 if(oa.hasOwnProperty(k))
				{   
				   if (( typeof ops[k] == "object")&&( typeof oa[k] == "object"))
				   set_opts(oa[k], ops[k]);
				   else ops[k]= oa[k];
          				cc=true;
				}
		}		 
		return cc;
	 };
	 
	 f=options;
	 var as,ad;
	 if(f)
	 {
	  f=false;
	   
	   
	   as=options.xaxes;
	   ad=plot.getXAxes();
	   //set_opts(as,ad);
	   var m=(as.length>ad.length)? ad.length:as.length;
	   for (var k=0;k<m;k++) f|=set_opts(as[k],ad[k].options);
	   as=options.yaxes;
	   ad=plot.getYAxes();
	   //set_opts(as,ad);
	   var m=(as.length>ad.length)?ad.length:as.length;
	   for (var k=0;k<m;k++) f|=set_opts(as[k],ad[k].options);
	  	 
	 }
	 
	 if(data) plot.setData(data);
	 if(f) 
     	 plot.setupGrid();
	 
	 plot.draw();

    }
 }
    
    $.plot.plugins.push({
        init: init,
        
        name: 'reset_data_axis',
        version: '1.0'
    });
	
})(jQuery);
