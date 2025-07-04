import React from 'react'

export default function IsLoadingHoc(HocComponent) {
  return ({isLoading,  ...props})=>{
    if(isLoading) return <div>Loading....</div>;

    return (
        <>
        <HocComponent {...props}/>

        </>
      )
  }
}
