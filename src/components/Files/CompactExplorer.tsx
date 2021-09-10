import React, { useEffect } from "react";
import { useBehaviorSubject } from "../usesubscribe/index";
import { client, fileservice, gitservice, Utils } from "../../App";
import path from 'path'
import { Col, Row } from "react-bootstrap";
import { faUndo, faPlus, faMinus, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { async } from "rxjs";

interface GitStatusProps {}

export const CompactExplorer: React.FC<GitStatusProps> = ({}) => {
  const files = useBehaviorSubject(fileservice.filetreecontent);
  let staged:any[] = [];
  let untracked:any[];
  let deleted:any[];
  let modified:any[];
  let alltrackedFiles:any[];
  let show = false
  fileservice.filetreecontent
    .subscribe((x) => {
      //Utils.log("GIT STATUS", files);
      staged = fileservice.getFilesByStatus("staged");
      untracked = fileservice.getFilesByStatus("untracked");
      deleted = fileservice.getFilesByStatus("deleted");
      modified = fileservice.getFilesByStatus("modified");
      show = (deleted.length>0 || staged.length>0 ||  untracked.length>0 || modified.length>0)
      alltrackedFiles = fileservice.getFilesWithNotModifiedStatus();
      alltrackedFiles = alltrackedFiles.filter((trackedFile) => {
        return staged.findIndex((stagedFile) => stagedFile.filename === trackedFile.filename) === -1
      })
      let total = alltrackedFiles.length
      
      client.onload(() => {
        client.emit('statusChanged', {
          key: total===0? 'none':total,
          type: total===0? '':'success',
          title: 'Git changes'
        })
      })
    })
    .unsubscribe();

  useEffect(() => {}, []);

  function RenderGroups(){
      //const groups = [{name:'Staged', group: staged}, {name:'Untracked',group:untracked},{name:'Modified', group:modified},{name:'Deleted', group:deleted}]
      const groups = [{name:'Staged', group: staged}, {name:'Changes', group: alltrackedFiles}]
      return (<>
        {
           groups.map((ob:any, index:number)=>{
                return (
                    <div key={`h${index}`}>
                    {ob.group.length>0? <h5 className='mb-3 mt-3'>{ob.name}</h5>:<></>}
                    <RenderFiles Files={ob.group} Type={ob.name}></RenderFiles>
                    </div>
                )
            })
        }
      
      </>)
  }

  async function fileClick(file:any){
    console.log(file)
    let status = fileservice.getFileStatusForFile(file.filename || "");
    if(status?.indexOf("modified")  !== -1){
      await client.call('manager', 'activatePlugin', 'gitdiff')
      await client.call('gitdiff' as any, 'diff', file.filename)
    }else{
      await client.call('fileManager', 'open', file.filename)
    }
  }

  function RenderFiles(ob:any) {
      console.log('FILES', ob)
      return (<>
        {
            ob.Files.map((file:any, index: number)=>{
                return (
                  <div key={`h${index}`}>
                    <Row className='mb-1'>
                        <Col className='col-8'>
                        <div className='pointer text-truncate' onClick={async() => fileClick(file)}>
                          <span data-id={`file${ob.Type}${path.basename(file.filename)}`} className='font-weight-bold'>{path.basename(file.filename)}</span>
                          <div className='text-secondary'> {file.filename}</div>
                        </div>
                        </Col>
                        <Col className='col-4 p-0'>
                          <Row>
                        <RenderButtons File={file} Type={ob.Type}></RenderButtons>
                        </Row>
                        </Col>
                    </Row>


                    </div>
                )
            })
        }
      </>)
  }

  function FunctionStatusIcons(ob:any){
    let status = ob.status
    return (<>
    <Col className='col-2 p-0'>
    {status?.indexOf("modified")  === -1? <></>: <button  className='btn btn-sm mr-1'>M</button> }
    {status?.indexOf("untracked")  === -1? <></>: <button  className='btn btn-sm  mr-1'>U</button> }
    {status?.indexOf("deleted")  === -1? <></>: <button  className='btn btn-sm  mr-1'>D</button> }
    {status?.indexOf("added")  === -1? <></>: <button  className='btn btn-sm  mr-1'>U</button> }
    </Col>
    </>)
  }
 

  function RenderButtons(ob:any){   
        let status = fileservice.getFileStatusForFile(ob.File.filename || "");
      if(ob.Type === 'Untracked'){
        return <>
            <button  onClick={async () => await gitservice.addToGit(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>
        </>
      }
      if(ob.Type === 'Staged'){
        return <>
        <Col className='col-8 p-0'>
            {status?.indexOf("modified")  === -1? <></>:<button onClick={async () => await gitservice.checkoutfile(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faUndo} className="" /></button>}
            <button data-id={`unStage${ob.Type}${path.basename(ob.File.filename)}`} onClick={async () => await gitservice.gitrm(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faMinus} className="" /></button>
            </Col>
            <FunctionStatusIcons status={status}/>
            
        </>
      }
      if(ob.Type === 'Modified'){
        return <>
            {status?.indexOf("staged")  !== -1? <></>:<button onClick={async () => await gitservice.addToGit(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>}
            <button onClick={async () => await gitservice.checkoutfile(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faUndo} className="" /></button>
        </>
      }
      if(ob.Type === 'Deleted'){
        return <>
            {status?.indexOf("staged")  !== -1? <></>:<button onClick={async () => await gitservice.gitrm(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>}
        </>
      }
      if(ob.Type === 'Changes'){
        return <>
            <Col className='col-8 p-0'>
            {status?.indexOf("modified")  === -1? <></>:<button onClick={async () => await gitservice.checkoutfile(ob.File.filename)} data-id={`undo${ob.Type}${path.basename(ob.File.filename)}`} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faUndo} className="" /></button>}
            {(status?.indexOf("unstaged")  !== -1 && status?.indexOf("deleted")  !== -1)? <></>:<button data-id={`addToGit${ob.Type}${path.basename(ob.File.filename)}`} onClick={async () => await gitservice.addToGit(ob.File.filename)} className='btn btn-sm btn-primary mr-1 float-right'><FontAwesomeIcon icon={faPlus} className="" /></button>}
            </Col>
            <FunctionStatusIcons status={status}/>
        </>
      }
      return <></>
  }

  return (
    <>
    {show?
    <>
    <div>
        <button data-id='stageAll' onClick={async () => await gitservice.addAllToGit()} className='btn btn-sm btn-primary'>Stage all</button>
        <button onClick={async () => await fileservice.syncFromBrowser()} className='btn btn-sm btn-primary ml-2'><FontAwesomeIcon icon={faSync} className="" /></button>
        <hr></hr>
        <RenderGroups></RenderGroups>
    </div></>
    :<>Nothing to commit
    <button onClick={async () => await fileservice.syncFromBrowser()} className='btn btn-sm btn-primary ml-2'><FontAwesomeIcon icon={faSync} className="" /></button>
    </>}
    </>
  );
};
