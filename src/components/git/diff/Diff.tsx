import React, { useEffect, useState } from "react";
import "./diff.css"
import { useBehaviorSubject } from "../../usesubscribe/index";
import { client, gitservice } from "../../../App";
import { DiffEditor } from "@monaco-editor/react"

interface DiffProps {}

export const DiffView: React.FC<DiffProps> = () => {
  const [theme, setTheme] = useState("vs-dark")
  const [sideBySide,setSideBySide] = useState(false)
  const diffs = useBehaviorSubject(gitservice.diffResult);

  gitservice.diffResult.subscribe((x) => { }).unsubscribe();


  const onSideBySideChange = (event: any) => {
    const target = event.target;
    const value = target.checked;
    setSideBySide(value)
  }
  
  const getFyleType = (name: string) => {
    if (name.includes(".sol")) return "sol"
    if (name.includes(".js")) return "javascript"
    return ""
  }

  useEffect(()=>{
    client.on("theme", "themeChanged", function (theme) {
      if (theme.quality === "dark") {
        setTheme("vs-dark")
      } else {
        setTheme("light")
      }
    })
},[])

  return (
    <div className='container-fluid'>
      <button className='btn btn-primary mb-3 mt-3' onClick={async() => await gitservice.diffFiles('')}>refresh</button>
      <button className='btn btn-primary mb-3 mt-3 ml-3' onClick={async () => { gitservice.fileToDiff = ''; await gitservice.diffFiles('') }}>show all</button>
      <br></br>
      <label>Side by side?</label>
      <input name='force' className='ml-2' checked={sideBySide} onChange={e => onSideBySideChange(e)} type="checkbox" id="ipfs" />
      {diffs?.map((diff) => {
        return (
          <>
            <br></br>
            <label>{diff?.originalFileName}</label>
            <DiffEditor
              height='50vh'
              original={diff?.past}
              modified={diff?.current}
              theme={theme}
              options={{ renderSideBySide: sideBySide }}
              originalLanguage={getFyleType(diff.originalFileName)}
              modifiedLanguage={getFyleType(diff.updatedFileName)}
        />
         </>
        );
      })}
      {diffs?.length===0?<><br></br>Nothing to see here.
        
      </>:<></>}
 </div>
  );
};
