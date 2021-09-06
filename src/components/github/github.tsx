import { faTrash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, createRef } from "react";
import { useState } from "react";
import { Alert, Card } from "react-bootstrap";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { async } from "rxjs";
import { gitservice, useLocalStorage } from "../../App";
import ConfirmDelete from "../ConfirmDelete";
import { useBehaviorSubject } from "../usesubscribe";

interface importerProps { }

export const GitHubImporter: React.FC<importerProps> = () => {

    const [currentRemote, setCurrentRemote] = useLocalStorage(
        "CURRENT_REMOTE",
        'origin'
    );
    const [cloneUrl, setCloneUrl] = useLocalStorage(
        "CLONE_URL",
        ''
    );

    const [cloneDepth, setCloneDepth] = useLocalStorage(
        "CLONE_DEPTH",
        1
    );

    const [url, setUrl] = useLocalStorage(
        "GITHUB_URL",
        ''
    );

    const branch = useBehaviorSubject(gitservice.branch);

    // const [branch, setBranch] = useLocalStorage(
    //     "GITHUB_BRANCH",
    //     'main'
    // );
    const [remoteBranch, setRemoteBranch] = useLocalStorage(
        "GITHUB_REMOTE_BRANCH",
        'main'
    );
    const [token, setToken] = useLocalStorage(
        "GITHUB_TOKEN",
        ''
    );
    const [force, setForce] = useLocalStorage(
        "GITHUB_FORCE",
        false
    );

    const [cloneAllBranches, setcloneAllBranches] = useLocalStorage(
        "GITHUB_CLONE_ALL_BRANCES",
        false
    );

    const [remoteName, setRemoteName] = useLocalStorage(
        "GITHUB_REMOTE_NAME",
        ''
    );

    const [name, setName] = useLocalStorage(
        "GITHUB_NAME",
        ''
    );

    const [email, setEmail] = useLocalStorage(
        "GITHUB_EMAIL",
        ''
    );
    const remotes = useBehaviorSubject(gitservice.remotes);


    let ModalRef = createRef<ConfirmDelete>();

    const clone = async () => {
        try {
            await ModalRef.current?.show();
            gitservice.clone(cloneUrl, '', token, cloneDepth, !cloneAllBranches)
        } catch (e) {

        }
    }

    const addRemote = async () => {
        await gitservice.addRemote(remoteName, url)
        setCurrentRemote(remoteName)
        await gitservice.getRemotes()
    }

    const delRemote = async (name: string) => {
        await gitservice.delRemote(name)
        await gitservice.getRemotes()
    }

    const push = async () => {
        gitservice.push(currentRemote, branch || '', remoteBranch, token, force, name, email)
    }

    const pull = async () => {
        gitservice.pull(currentRemote, branch || '', remoteBranch, token, name, email)
    }

    const fetch = async () => {
        gitservice.fetch(url, branch || '', remoteBranch, token, name, email)
    }

    const onUrlChange = (value: string) => {
        setUrl(value)
    }
    const onCloneUrlChange = (value: string) => {
        setCloneUrl(value)
    }
    const onBranchChange = (value: string) => {
        //setBranch(value)
    }
    const onRemoteBranchChange = (value: string) => {
        setRemoteBranch(value)
    }
    const onTokenChange = (value: string) => {
        setToken(value)
    }
    const onAllBranchChange = (event: any) => {
        const target = event.target;
        const value = target.checked;
        setcloneAllBranches(value)
    }
    const onForceChange = (event: any) => {
        const target = event.target;
        const value = target.checked;
        setForce(value)
    }
    const onNameChange = (value: string) => {
        setName(value)
    }
    const onRemoteNameChange = (value: string) => {
        setRemoteName(value)
    }
    const onEmailChange = (value: string) => {
        setEmail(value)
    }

    const onDepthChange = (value: number) => {
        setCloneDepth(value)
    }

    const remoteChange = (name: string) => {
        setCurrentRemote(name)
    }

    return (
        <>
            <ConfirmDelete
                title={"Cloning"}
                text={"This will create a new workspace! Your repo might be to big and crash the browser! Continue?"}
                ref={ModalRef}
            ></ConfirmDelete>

            {token ? <></> :
                <Alert variant='warning'>Missing GitHub personal token. Only cloning available.<br></br>
                    <a href='https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token' target='_blank'>More info on personal access tokens...</a>
                </Alert>}
            {name ? <></> :
                <Alert variant='warning'>Missing GitHub name & email.</Alert>
            }
            <h4>Available remotes</h4>
            {
                remotes?.map((remote, index:number) => {
                    return <div key={index} className='row mb-1'>
                        <div className='col'>
                            <Card>
                                <Card.Body className='p-1'>
                                <input checked={currentRemote === remote.remote} onChange={async () => remoteChange(remote.remote)} type="radio" className='mr-2' value={remote.remote} id={remote.remote}
                                name="remote" />
                            <a className='mr-2' href={remote.url} target="_blank">{remote.remote}<br></br>{remote.url}</a>
                                </Card.Body>
                            </Card>

                        </div>
                        <div className='col'>
                            <button
                                onClick={async () =>
                                    await delRemote(remote.remote)
                                }
                                className="btn btn-danger btn-sm delete3b-btn mt-1"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                })
            }
            {(remotes && remotes?.length > 0) ? <></> : <div>No remotes are set</div>}
            <hr></hr>
            <h4>commands</h4>
            <div className='row'>
                <div className='col col-md-6 col-12'>
                    <label>LOCAL BRANCH</label>
                    <input name='localbranch' readOnly value={branch} className="form-control" type="text" id="ipfs" />
                </div>
                <div className='col col-md-6 col-12'>
                    <label>REMOTE BRANCH</label>
                    <input name ='remotebranch' onChange={e => onRemoteBranchChange(e.target.value)} value={remoteBranch} className="form-control" type="text" id="ipfs" />
                </div></div>
            <button className='btn btn-primary m-2' onClick={async () => {
                await gitservice.init()
            }}>init</button>
            <button className='btn btn-primary m-2' onClick={async () => {
                push()
            }}>push</button>
            <button className='btn btn-primary m-2' onClick={async () => {
                pull()
            }}>pull</button>
            <button className='btn btn-primary m-2 d-none' onClick={async () => {
                fetch()
            }}>fetch</button>
            <label>FORCE PUSH</label>
            <input name='force' className='ml-2' checked={force} onChange={e => onForceChange(e)} value={token} type="checkbox" id="ipfs" />
            <hr></hr>
            <h4>GIT REMOTE</h4>
            <div className='row'>
                <div className='col col-md-6 col-12'>
                    <label>NAME</label>
                    <input name='remotename' onChange={e => onRemoteNameChange(e.target.value)} value={remoteName} className="form-control" type="text" id="ipfs" />
                </div>
                <div className='col col-md-6 col-12'>
                    <label>URL</label>
                    <input name='remoteurl' onChange={e => onUrlChange(e.target.value)} value={url} className="form-control" type="text" id="ipfs" />
                </div>
            </div>


            <button className='btn btn-primary m-2' onClick={async () => {
                addRemote()
            }}>add remote</button><br></br>
            <hr></hr>
            <h4>CLONE</h4>
            <div className='row'>
                <div className='col col-md-6 col-12'>
                    <label>URL</label>
                    <input name='cloneurl' onChange={e => onCloneUrlChange(e.target.value)} value={cloneUrl} className="form-control" type="text" id="ipfs" />
                </div>
                <div className='col col-md-6 col-12'>
                    <label>DEPTH **</label>
                    <input name='clonedepth' onChange={e => onDepthChange(parseInt(e.target.value))} value={cloneDepth} className="form-control" type="number" id="ipfs" />
                </div>

            </div>
            <div className='row'>
                <div className='col col-md-6 col-12'>
                    <label>CLONE ALL BRANCHES?</label><br></br>
                    <input name='clonallbranches' onChange={e => onAllBranchChange(e)} checked={cloneAllBranches} className="" type="checkbox" id="ipfs" />
                </div>
            </div>
            <button className='btn btn-primary m-2' onClick={async () => {
                clone()
            }}>clone</button>
            <hr></hr>
            <h4>CONFIG</h4>
            <label>PERSONAL GITHUB TOKEN</label>
            <input name='token' readOnly onFocus={e => e.target.readOnly = false} onBlur={e => e.target.readOnly = true} onChange={e => onTokenChange(e.target.value)} value={token} className="form-control" autoComplete="off" type="password" id="ipfs" />
            <CopyToClipboard
                text={token}
                onCopy={() => {
                    toast.success("Copied to clipboard.");
                }}
            >
                <button className="mt-2 btn btn-primary mb-2 btn-sm">Copy token to clipboard</button>
            </CopyToClipboard>
            <div className='row'>
                <div className='col col-md-6 col-12'>
                    <label>NAME</label>
                    <input name='name' onChange={e => onNameChange(e.target.value)} value={name} className="form-control" type="text" id="ipfs" />
                </div>
                <div className='col col-md-6 col-12'>
                    <label>EMAIL</label>
                    <input name='email' onChange={e => onEmailChange(e.target.value)} value={email} className="form-control" type="text" id="ipfs" />
                </div>
            </div>






            <hr></hr>

            <div>
                ** save space in your browser and clone less commits
            </div>
            <div>
                To use this you need to get a personal access token on GitHub and add REPO permissions.<br></br>
                <a href='https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token' target='_blank'>More info on personal access tokens...</a>
            </div>

        </>
    );
};
