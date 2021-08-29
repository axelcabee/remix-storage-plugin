import React, { useEffect, useState } from "react";
import { ReactGhLikeDiff } from "react-gh-like-diff";
import "./diff.css"
import { useBehaviorSubject } from "../../usesubscribe/index";
import { gitservice, Utils } from "../../../App";
import { async } from "rxjs";

interface DiffProps {}

export const DiffView: React.FC<DiffProps> = ({}) => {
  const [mock, setMock] = useState("");
  const diffs = useBehaviorSubject(gitservice.diffResult);

  gitservice.diffResult.subscribe((x)=>{}).unsubscribe();

  return (
    <div className='container-fluid'>
      <button className='btn btn-primary mb-3 mt-3' onClick={async() => await gitservice.diffFiles('')}>refresh</button>
      <button className='btn btn-primary mb-3 mt-3 ml-3' onClick={async() =>  { gitservice.fileToDiff = '';  await gitservice.diffFiles('')}}>show all</button>
      {diffs?.map((diff) => {
        return (
           
          <ReactGhLikeDiff key={diff.originalFileName}
            options={{
              outputFormat: 'line-by-line',
              originalFileName: diff?.originalFileName,
              updatedFileName: diff?.updatedFileName,
            }}
            past={diff?.past}
            current={diff?.current}
          />
         
        );
      })}
      {diffs?.length===0?<><br></br>Nothing to see here.
        
      </>:<></>}
 </div>
  );
};
