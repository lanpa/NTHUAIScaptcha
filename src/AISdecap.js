


var net = new convnetjs.Net();
net.fromJSON(jsonObj);



var img = new Image()
imgsrc = document.getElementsByName("passwd2")[0].nextSibling.nextSibling.src;
img.src = imgsrc;

var mycanvas = document.createElement("canvas");
mycanvas.id = "mycanvas"; document.body.appendChild(mycanvas);
ctx = mycanvas.getContext("2d")
var mycanvas2 = document.createElement("canvas");
mycanvas2.id = "mycanvas2"; document.body.appendChild(mycanvas2);
ctx2 = mycanvas2.getContext("2d")
var mycanvas3 = document.createElement("canvas");
mycanvas3.id = "mycanvas3"; document.body.appendChild(mycanvas3);
ctx3 = mycanvas3.getContext("2d")
var mycanvas4 = document.createElement("canvas");
mycanvas4.id = "mycanvas4"; document.body.appendChild(mycanvas4);
ctx4 = mycanvas4.getContext("2d")



var testarray = new Array();
for(i=0;i<6;i++){
    testarray.push(document.createElement("canvas"));
    testarray[i].id = "mycanvas2"+i;
    document.body.appendChild(testarray[i]);
}




img.onload = function(){
    // wait until image has been loaded
    ctx.drawImage(img,0,0);
    var imgData=ctx.getImageData(0,0,img.width,img.height);
    // invert colors
    for (var i=0;i<imgData.data.length;i+=4){
        var sum = imgData.data[i]+imgData.data[i+1]+imgData.data[i+2];
        if(sum<450){ //dark enough
            imgData.data[i] = 255;
            imgData.data[i+1] = 255;
            imgData.data[i+2] = 255;
        }
        else{
            imgData.data[i] = 0;
            imgData.data[i+1] = 0;
            imgData.data[i+2] = 0;
        }
        imgData.data[i+3]=255;
    }
    ctx.putImageData(imgData,0,0);
    w = img.width;
    h = img.height;
    var step = Math.floor(w/6);
    var vertical_sum = new Array(w);
    for(i=0;i<w;i++){
        vertical_sum[i] = 0

        for(j=0;j<h;j++){
            vertical_sum[i]+=imgData.data[j*w*4+i*4]/255;
        }
        start = 0;
        end = h-1;
        for(j=0;j<h;j++){
            if(imgData.data[j*w*4+i*4]/255>0.99){
                start = j;
                break;
            }
        }
        for(j=h-1;j>start;j--){
            if(imgData.data[j*w*4+i*4]/255>0.99){
                end = j;
                break;
            }
        }
        if(start==0 && end==h-1)
            ;//vertical_sum[i] = 0;
        else
            vertical_sum[i] = end-start+vertical_sum[i];
        console.log(i,start,end);
        //imgData.data[i*4] = vertical_sum[i]*20;
    }
    var vertical_sum_blur = new Array(w);
    for(i=1;i<w-1;i++){
        vertical_sum_blur[i] = (vertical_sum[i]+vertical_sum[i-1]+vertical_sum[i+1])/3;
        imgData.data[i*4] = vertical_sum_blur[i]*20;
        console.log(vertical_sum_blur[i])
    }

    vertical_sum = vertical_sum_blur;
    dvertical_sum_dx = new Array(w);
    for(i=1;i<w-1;i++){
        dvertical_sum_dx[i] = vertical_sum[i+1]-vertical_sum[i];
    }
    sliceLoc = new Array(7);
    sliceLoc[0] = 1;
    sliceLoc[6] = w;
    for(i=1;i<6;i++){
        imgData.data[Math.floor(i*step*4+w*4)+1] = 255;
        imgData.data[Math.floor(i*step*4+w*8)+1] = 255;
        imgData.data[Math.floor(i*step*4+w*12)+1] = 255;
        x = i*step;
        //console.log('===='+x+'====');
        min = 1000;
        minIdx = x;
        for(shift=-5; shift<5; shift++){
            xx = x+shift;
            if(vertical_sum[xx]<min){
                min = vertical_sum[xx];
                minIdx = xx;
            }
            //console.log(xx, vertical_sum[xx]);
        }
        sliceLoc[i] = minIdx;
        //console.log(minIdx);
    }

    //ctx.putImageData(imgData,0,0);


    var leadingzero = false
    var ans = 0;
    var img_data = new Array(6);
    for(i=0;i<6;i++){
        img_data[i] = ctx.getImageData(sliceLoc[i], 0,  sliceLoc[i+1]-sliceLoc[i], img.height);
        cm = centerOfMass(img_data[i]);
        //cx = cm[0];
        cy = cm[1];
        tmp = ctx.getImageData(sliceLoc[i], (cy-15), sliceLoc[i+1]-sliceLoc[i], img.height);
        ctx2.putImageData(tmp,0,0);
        ctx2_individual = testarray[i].getContext("2d");
        ctx2_individual.putImageData(tmp,0,0);
        mycanvas3.height = 31;
        mycanvas3.width = 31;
        //ctx3: cropped digit in 31x31
        ctx3.fillStyle = "#000000";
        ctx3.fillRect(0,0,31,31);
        ctx3.drawImage(testarray[i],11,0);
        ctx4.drawImage(mycanvas3,i*40,0);

        testarray[i].width = 24;
        testarray[i].height = 24;
        ctx2_individual = testarray[i].getContext("2d");
        //ctx2_individual: scale the 31x31 image to 24x24
        //ctx2_individual.drawImage(mycanvas3,0,0,24,24);
        ctx2_individual.drawImage(mycanvas3,-3,-3,28,28);

        img_resz = ctx2_individual.getImageData(0, 0, 24, 24);
        //ctx4: concatenated ctx3 images
        //console.log(img_resz.data);
        // NN predict
        var x = new convnetjs.Vol(24,24,1,0.0);
        for(j=0;j<img_resz.width*img_resz.height;j++){
            if(img_resz.data[j*4]>30){
                x.w[j] = 1;
            }
            else{
                x.w[j] = 0;
            }
        }
        net.forward(x);
        console.log(net.layers[8].es[net.getPrediction()]);
        //net.getPrediction();
        ans = ans*10 + net.getPrediction();
        if(i==0 && net.getPrediction()==0)
            leadingzero = true
        document.getElementsByName("passwd2")[0].value = document.getElementsByName("passwd2")[0].value+net.getPrediction().toString();
        //alert('paused');
    }

    //document.getElementsByName("passwd2")[0].value = ans.toString();
    //if(leadingzero)
    //    document.getElementsByName("passwd2")[0].value = '0'+ans.toString();

    document.getElementsByName("passwd2")[0].onclick = function(){document.getElementsByName("passwd2")[0].value = "";}
};

function centerOfMass(arr){    
    h = arr.height;
    w = arr.width;
    var sum_ximi = 0;
    var sum_yimi = 0;
    var sum_mi = 0;
    for(var i=0;i<h;i++){
        for(var j=0;j<w;j++){
            ind = (i*w+j)*4;
            sum_ximi += arr.data[ind]*j;
            sum_yimi += arr.data[ind]*i;
            sum_mi += arr.data[ind];
        }
    }
    //console.log(sum_ximi/sum_mi);
    //console.log(sum_yimi/sum_mi);
    return [sum_ximi/sum_mi, sum_yimi/sum_mi];
}

