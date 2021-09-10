/// <reference types="cypress" />
import { Profile, LocationProfile, ExternalProfile } from '@remixproject/plugin-utils'

context('Actions', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8080')
        cy.viewport('macbook-16')
        cy.wait(2000)
        cy.get('#remixTourSkipbtn').click()
        cy.wait(2000)
        installPlugin({
            name: plugin,
            displayName: 'dgit',
            location: 'sidePanel',
            url: 'http://localhost:3000',
            canActivate: [
                'dGitProvider'
            ]
        })
    })

    const installPlugin = (profile: Profile & LocationProfile & ExternalProfile) => {
        cy.get('*[plugin="pluginManager"]').click().wait(1000)
        cy.get(`*[data-id="pluginManagerComponentPluginSearchButton`).click().wait(1000)
        cy.get(`*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalTitle-react`).should('be.visible')
        cy.wait(2000)
        cy.get(`*[data-id="localPluginName`).type(profile.name)
        cy.get(`*[data-id="localPluginDisplayName`).type(profile.displayName)
        cy.get(`*[data-id="localPluginUrl`).type(profile.url)
        cy.get(`*[data-id="localPluginCanActivate`).type(profile.canActivate && profile.canActivate.join(','))
        cy.get(`*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react"`).click()
    }

    const activatePlugin = (plugin:string) => {
        cy.get('*[plugin="pluginManager"]').click()
        cy.get(`*[data-id="pluginManagerComponentActivateButton${plugin}"]`, { timeout: 10000 }).click()
    }

    const openPlugin = (plugin: string) => {
        //cy.get('*[plugin="pluginManager"]').should('be.visible')

        cy.get(`#icon-panel div[plugin="${plugin}"]`, { timeout: 10000 }).click()
        cy.wait(3000)
    }


    const getIframeDocument = (plugin: string) => {
        return cy
            .get(`iframe[id="plugin-${plugin}"]`)
            // Cypress yields jQuery element, which has the real
            // DOM element under property "0".
            // From the real DOM iframe element we can get
            // the "document" element, it is stored in "contentDocument" property
            // Cypress "its" command can access deep properties using dot notation
            // https://on.cypress.io/its
            .its('0.contentDocument').should('exist')
    }

    const getIframeBody = (plugin: string) => {
        // get the document
        return getIframeDocument(plugin)
            // automatically retries until body is loaded
            .its('body').should('not.be.undefined')
            // wraps "body" DOM element to allow
            // chaining more Cypress commands, like ".find(...)"
            .then(cy.wrap)
    }

    const stageAll = ()=> {
        cy.wait(2000)
        getIframeBody(plugin).find('*[data-id="stageAll"]').should('be.visible').click()
    }

    const clickTab = (name:string) => {
        cy.wait(2000)
        getIframeBody(plugin).find('.btn').contains(name).click()
        cy.wait(2000)
    }

    const setToken = () => {
        getIframeBody(plugin).find('input[name="token"]').focus().wait(100).clear().type('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')
    }

    const plugin: string = 'dgitcypress'
    describe('File operations', () => {

        it.only('publishes on Remix IPFS and imports it', () => {
            openPlugin(plugin)
            stageAll()
            getIframeBody(plugin).find('*[data-id="commitMessage"]').should('be.visible').type('cypress')
            getIframeBody(plugin).find('*[data-id="commitButton"]').should('be.visible').click()
            getIframeBody(plugin).contains('Nothing to commit').should('be.visible')
            cy.wait(2000)
            clickTab('IPFS Settings')
            cy.wait(1000)
            getIframeBody(plugin).find(`#hostname`).clear().type('ipfs.remixproject.org')
            getIframeBody(plugin).find('#btncheckipfs').should('be.visible').click()
            clickTab('IPFS Export')
            cy.wait(1000)
            getIframeBody(plugin).find('#addtocustomipfs').should('be.visible').click()
            getIframeBody(plugin).find('#ipfshashresult').should('be.visible').invoke('data', 'hash').as('dataHash')
            clickTab('IPFS Import')
            cy.wait(1000)
            cy.get('@dataHash')
                .then(dataId => {
                    getIframeBody(plugin).find('.localipfsimportbutton[data-hash="' + dataId + '"]').should('be.visible').click()
                    cy.wait(1000)
                    getIframeBody(plugin).find('.btn').contains('Yes').should('be.visible').click()
                    cy.wait(4000)
                    cy.get('.btn').contains('Accept').should('be.visible').click()
                    cy.wait(4000)
                    openPlugin('filePanel')
                    cy.get('#workspacesSelect option:selected').should('contain.text', 'workspace_')
                    cy.contains('README.txt').should('be.visible')
                });
            
        })
        it('sees modified files and checks them out', () => {
            //activatePlugin(plugin)
            openPlugin(plugin)
            stageAll()
            getIframeBody(plugin).find('*[data-id="commitMessage"]').should('be.visible').type('cypress')
            getIframeBody(plugin).find('*[data-id="commitButton"]').should('be.visible').click()
            getIframeBody(plugin).contains('Nothing to commit').should('be.visible')
            cy.wait(2000)
            getIframeBody(plugin).find('.btn').contains('Log').click()
            cy.wait(1000)
            getIframeBody(plugin).contains('cypress').should('be.visible')
            getIframeBody(plugin).find('.btn').contains('git checkout').should('be.visible')
            openPlugin('filePanel')
            cy.get('div').contains('README.txt').click()
            cy.get('.ace_content').type('changing file')
            openPlugin(plugin)
            cy.wait(2000)
            clickTab('Files')
            getIframeBody(plugin).find('*[data-id="fileChangesREADME.txt"]').should('be.visible')
            getIframeBody(plugin).find('*[data-id="undoChangesREADME.txt"]').should('be.visible').click()
            cy.wait(500)
            cy.get('.btn').contains('Accept').should('be.visible').click()
            cy.wait(1000)
            getIframeBody(plugin).contains('Nothing to commit').should('be.visible')
        })
        it('set ipfs configuration', () => {
            openPlugin(plugin)
            clickTab('IPFS Settings')
            getIframeBody(plugin).find(`#hostname`).clear().type('ipfs-does-not-exist.remixproject.org')
            getIframeBody(plugin).find('#btncheckipfs').should('be.visible').click()
            cy.wait(4000)
            getIframeBody(plugin).find('#ipfscheckerror').should('be.visible')
            getIframeBody(plugin).find(`#hostname`).clear().type('ipfs.remixproject.org')
            getIframeBody(plugin).find('#btncheckipfs').should('be.visible').click()
            cy.wait(4000)
            getIframeBody(plugin).find('#ipfschecksuccess').should('be.visible')
        })
        it('clones a repo', () => {
            //activatePlugin(plugin)
            openPlugin(plugin)
            clickTab('GitHub')
            setToken()
            getIframeBody(plugin).find('input[name="cloneurl"]').focus().wait(100).clear().type('https://github.com/bunsenstraat/empty')
            cy.wait(1000)
            getIframeBody(plugin).find('*[data-id="clonebtn"]').should('be.visible').click()
            cy.wait(1000)
            getIframeBody(plugin).find('.btn').contains('Yes').should('be.visible').click()
            cy.wait(1000)
            cy.get('.btn').contains('Accept').should('be.visible').click()
            cy.wait(2000)
            openPlugin('filePanel')
            cy.wait(1000)
            cy.contains('README.txt').should('be.visible')
            openPlugin(plugin)
            cy.wait(2000)
            getIframeBody(plugin).find('.btn').contains('Log').click()
            cy.wait(1000)
            getIframeBody(plugin).contains('798789').should('be.visible')
            getIframeBody(plugin).find('.btn').contains('git checkout').should('be.visible')
        })

        it('detects file added', () => {
            //activatePlugin(plugin)
            openPlugin(plugin)
            openPlugin('filePanel')
            cy.get('*[data-id="fileExplorerNewFilecreateNewFile"]').click()
            cy.wait(500)
            cy.get('*[data-id$="/blank"] .remixui_items').type(`addedfile.sol{enter}`)
            cy.wait(500)
            cy.focused().type('test')
            openPlugin(plugin)
            getIframeBody(plugin).find('*[data-id="fileChangesaddedfile.sol"]').should('be.visible')
        })

        it('commits staged files', () => {
            //activatePlugin(plugin)
            openPlugin(plugin)
            stageAll()
            getIframeBody(plugin).find('*[data-id="commitMessage"]').should('be.visible').type('cypress')
            getIframeBody(plugin).find('*[data-id="commitButton"]').should('be.visible').click()
            getIframeBody(plugin).contains('Nothing to commit').should('be.visible')
            cy.wait(2000)
            getIframeBody(plugin).find('.btn').contains('Log').click()
            cy.wait(1000)
            getIframeBody(plugin).contains('cypress').should('be.visible')
            getIframeBody(plugin).find('.btn').contains('git checkout').should('be.visible')
        })

 
        it('opens the dgit plugin and stages a file', () => {
            //activatePlugin(plugin)
            openPlugin(plugin)
            getIframeBody(plugin).find('*[data-id="fileChangesREADME.txt"]').should('be.visible')
            getIframeBody(plugin).find('*[data-id="addToGitChangesREADME.txt"]').should('be.visible').click()
        })

        it('opens the dgit plugin and stages a file and unstages it', () => {
            //activatePlugin(plugin)
            openPlugin(plugin)
            cy.wait(2000)
            getIframeBody(plugin).find('*[data-id="fileChangesREADME.txt"]').should('be.visible')
            cy.wait(2000)
            getIframeBody(plugin).find('*[data-id="addToGitChangesREADME.txt"]').should('be.visible').click()
            cy.wait(2000)
            getIframeBody(plugin).find('*[data-id="fileStagedREADME.txt"]').should('be.visible')
            cy.wait(2000)
            getIframeBody(plugin).find('*[data-id="unStageStagedREADME.txt"]').should('be.visible').click()
            //getIframeBody(plugin).find('*[data-id="fileChangesREADME.txt"]').should('be.visible')
        })

        it('opens the dgit plugin and stages all files', () => {
            //activatePlugin(plugin)
            openPlugin(plugin)
            cy.wait(2000)
            getIframeBody(plugin).find('*[data-id="fileChangesREADME.txt"]').should('be.visible')
            stageAll()
            cy.wait(2000)
            getIframeBody(plugin).find('*[data-id="fileStagedREADME.txt"]').should('be.visible')
            getIframeBody(plugin).find('*[data-id="fileStaged1_Storage.sol"]').should('be.visible')
            getIframeBody(plugin).find('*[data-id="fileStaged4_Ballot_test.sol"]').should('be.visible')
        })




    })
})
