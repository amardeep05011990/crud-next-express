import React, { useState } from 'react'
import Child from './Child'
import HocImp from './HocImp';
import IsLoadingHoc from './IsLoadingHoc';

export default function Parent() {
    const [isLoading, setIsLoading] = useState(true);
const LoadingHocwith = IsLoadingHoc(HocImp)
    const data = "i am from parent to child"
    const [childData, setChildData] = useState("");
    const handleFromChild = (datafromchild)=>{
        setChildData(datafromchild)
        console.log("dataFromChildToParent", datafromchild)
    }
  return (
    <>
    <LoadingHocwith isLoading={isLoading} />
    <div>Parent vvvvvvv {childData}</div>
    <Child dataFromParentToChild={data} dataFromChildToParent={handleFromChild}/>
    </>
  )
}
