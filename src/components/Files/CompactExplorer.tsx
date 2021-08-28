import React, { useEffect } from "react";
import { useBehaviorSubject } from "../usesubscribe/index";
import { fileservice, gitservice, Utils } from "../../App";
import path from 'path'
import { Col, Row } from "react-bootstrap";
import { faArrowCircleLeft, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface GitStatusProps {}

export const CompactExplorer: React.FC<GitStatusProps> = ({}) => {
  const files = useBehaviorSubject(fileservice.filetreecontent);
  let staged:any[] = [];
  let untracked:any[];
  let deleted:any[];
  let modified:any[];
  let show = false
  fileservice.filetreecontent
    .subscribe((x) => {
      //Utils.log("GIT STATUS", files);
      staged = fileservice.getFilesByStatus("staged");
      untracked = fileservice.getFilesByStatus("untracked");
      deleted = fileservice.getFilesByStatus("deleted");
      modified = fileservice.getFilesByStatus("modified");
      show = (deleted.length>0 || staged.length>0 ||  untracked.length>0 || modified.length>0)

    })
    .unsubscribe();

  useEffect(() => {}, []);

  function RenderGroups(){
      const groups = [{name:'Staged', group: staged}, {name:'Untracked',group:untracked},{name:'Modified', group:modified},{name:'Deleted', group:deleted}]
      return (<>
        {
           groups.map((ob:any)=>{
                return (
                    <>
                    {ob.group.length>0? <h5>{ob.name}</h5>:<></>}
                    <RenderFiles Files={ob.group} Type={ob.name}></RenderFiles>
                    </>
                )
            })
        }
      
      </>)
  }

  function RenderFiles(ob:any) {
      console.log('FILES', ob)
      return (<>
        {
            ob.Files.map((file:any)=>{
                return (
                    <>
                    <Row className='mb-1'>
                        <Col className='col-8'>
                        <div>{path.basename(file.filename)}</div>
                        </Col>
                        <Col className='col'>
                        <RenderButtons File={file} Type={ob.Type}></RenderButtons>
                        </Col>
                    </Row>


                    </>
                )
            })
        }
      </>)
  }

  function RenderButtons(ob:any){   
        let status = fileservice.getFileStatusForFile(ob.File.filename || "");
      if(ob.Type === 'Untracked'){
        return <>
            <button onClick={async () => await gitservice.addToGit(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>
        </>
      }
      if(ob.Type === 'Staged'){
        return <>
            {status?.indexOf("modified")  === -1? <></>:<button onClick={async () => await gitservice.checkoutfile(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faArrowCircleLeft} className="" /></button>}
        </>
      }
      if(ob.Type === 'Modified'){
        return <>
            {status?.indexOf("staged")  !== -1? <></>:<button onClick={async () => await gitservice.addToGit(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>}
            <button onClick={async () => await gitservice.checkoutfile(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faArrowCircleLeft} className="" /></button>
        </>
      }
      if(ob.Type === 'Deleted'){
        return <>
            {status?.indexOf("staged")  !== -1? <></>:<button onClick={async () => await gitservice.gitrm(ob.File.filename)} className='btn btn-sm btn-primary mr-1'><FontAwesomeIcon icon={faPlus} className="" /></button>}
        </>
      }
      return <></>
  }

  return (
    <>
    {show?
    <>
    <div>
        <button onClick={async () => await gitservice.addAllToGit()} className='btn btn-sm btn-primary'>Add all</button>
        <hr></hr>
        <RenderGroups></RenderGroups>
    </div></>
    :<>Nothing to commit</>}
    </>
  );
};
