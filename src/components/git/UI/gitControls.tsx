import React, { useState } from "react";
import { useBehaviorSubject } from "../../usesubscribe/index";
import { gitservice } from "../../../App";
import { GitBranch } from "./gitBranch";
import { GitLog } from "./gitLog";

interface gitViewProps {
  compact: boolean
}

export const GitControls: React.FC<gitViewProps> = (props) => {
  const canCommit = useBehaviorSubject(gitservice.canCommit)
  const [message,setMessage] = useState({value:''})

  gitservice.canCommit.subscribe((x)=>{}).unsubscribe()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=> {
      setMessage({value:e.currentTarget.value})
  }

  const commitAllowed = ()=>{
    return canCommit === false || message.value ===""
  }

  return (
    <>
      <div className="form-group">
        <label>Message</label>
        <input className="form-control" type="text" onChange={handleChange} value={message.value} />
      </div>
      {canCommit?<></>:<div className='alert alert-warning'>Cannot commit in detached state! Create a new branch and check it out first or checkout main.<br></br></div>}
      <button className="btn btn-primary" disabled={commitAllowed()} onClick={async()=>gitservice.commit(message.value)} >git commit</button>
      <hr></hr>
    </>
  );
};
