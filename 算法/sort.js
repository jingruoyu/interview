//快速插入排序
function InsertSort(arr){
  var len=arr.length;
  for(var i=1;i<len;i++){
    var x=arr[i];
    var j=i-1;
    while(x<arr[j]){//新数据插入前面已经排好序的部分
      arr[j+1]=arr[j];
      arr[j]=x;
      j--;
    }
    console.log(i+": "+arr);
  }
}


//希尔排序
function ShellInsertSort(arr){
    var len=arr.length;
    var dk=parseInt(len/2);
    while(dk>=1){
        for(var i=dk;i<len;i++){//间距为dk，扫描数组
            var x=arr[i];
            var j=i-dk;
            while(x<arr[j]){//新数据插入前面已经排好序的部分
                arr[j+dk]=arr[j];
                arr[j]=x;
                j=j-dk;
            }
        }
        console.log(arr.join(" ")+"   "+dk);
        dk=parseInt(dk/2);
    }
}

//简单选择排序
function SelectSort(arr){
    var len=arr.length;
    for(var i=0;i<len;i++){
        var k=i;
        for(var j=i+1;j<n;j++){//遍历后续部分选取最小的数
            if(arr[k]>arr[j]){
                k=j;
            }
        }
        if(k!=i){//将最小数放到最前面
            var x=arr[k];
            arr[k]=arr[i];
            arr[i]=x;
        }
        console.log(arr.join(" "));
    }
}

//冒泡排序
function BubbleSort(arr){
    var len=arr.length;
    for(var i=0;i<len;i++){
        for(var j=0;j<len-i;j++){
            if(arr[j]>arr[j+1]){//对比相邻二者大小
                var x=arr[j+1];
                arr[j+1]=arr[j];
                arr[j]=x;
            }
        }
    }
}

//快速排序，此排序需要递归调用
function QuickSort(arr,low,high){
    if(low<high){
        var privotKey=partition(arr,low,high);//基准在数组中位置
        QuickSort(arr,low,privotKey-1);//对基准前面的部分递归排序
        QuickSort(arr,privotKey+1;high);//对基准后面的部分递归排序
    }
}
function partition(arr,low,high){
    //初始low指向基准
    var x=arr[low];//选取的基准
    while(low<high){
        while(low<high&&x<arr[high]) high--;//从后面向基准对比，若后面数比基准小，中断循环
        exchange(arr,low,high);//交换较小数与基准位置，然后high指向基准
        while(low<high&&x>arr[low]) low++;//从前面向基准对比，若前面数比基准大，中断循环
        exchange(arr,low,high);//交换较大数与基准位置，然后low指向基准
    }
    //循环完毕后low与high均指向基准位置
    return low;//返回基准在数组中位置
}
function exchange(arr,pos1,pos2){//交换数组中两个位置内容
    var x=arr[pos1];
    arr[pos1]=arr[pos2];
    arr[pos2]=x;
}

//归并排序
function MergeSort(arr,low,high){
    if(low<high){
        var mid=parseInt((low+high)/2);//迭代分割数组
        MergeSort(arr,low,mid);
        MergeSort(arr,mid+1,high);
        merge(arr,low,mid,high);//归并数组
    }
}
//归并函数
function merge(arr,low,mid,high){
    var i=low;
    var j=mid+1;
    var arr1=[];
    while(i<=mid && j<=high){
        //较小值放入新数组
        if(arr[i]<=arr[j]){
            arr1.push(arr[i]);
            i++;
        }else{
            arr1.push(arr[j]);
            j++;
        }
    }
    //剩余值全部放进新数组
    if(i<=mid){
        arr1 = arr1.concat(arr.slice(i,mid+1));
    }
    if(j<=high){
        arr1 = arr1.concat(arr.slice(j,high+1));
    }
/*    //剩余值全部放进新数组
    while(i<=mid){
        arr1.push(arr[i]);
        i++;
    }
    if(j<=high){
        arr1.push(arr[j]);
        j++;
    }*/
    //更新原数组
    for(var k=0;k<=high-low;k++){
        arr[k+low] = arr1[k];
    }
}