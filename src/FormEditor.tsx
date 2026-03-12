import React, { useEffect, useMemo, useRef, useState } from 'react'
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor'
import { Retool } from '@tryretool/custom-component-support'
import { scratch } from './email-templates/scratch'
import { getCustomFormBlockJS } from './custom-blocks/form-block'
import { getSignupFormsEditorCustomCSS } from './custom-blocks/form-blockCss'
import { getTestBlockJS } from './custom-blocks/test-block'

export const FormEditor = () => {
  const [projectId] = Retool.useStateString({ name: 'projectId' })
  const [emailDesign, setEmailDesign] = Retool.useStateString({
    name: 'emailDesign'
  })
  const [currentDesign, setCurrentDesign] = useState('')
  const [emailHtml, setEmailHtml] = Retool.useStateString({ name: 'emailHtml' })
  const [emailImage, setEmailImage] = Retool.useStateString({
    name: 'emailImage'
  })
  const triggerSave = Retool.useEventCallback({ name: 'triggerSave' })
  const emailEditorRef = useRef<EditorRef>(null)
  const [retoolId] = Retool.useStateString({ name: 'retoolId' })

  const isJson = (str: string) => {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  const saveEmail = () => {
    const unlayer = emailEditorRef.current?.editor
    unlayer?.exportImage((data) => {
      const { url } = data
      setEmailImage(url || '')
      unlayer?.exportHtml((data) => {
        const { design, html } = data
        setEmailDesign(JSON.stringify(design))
        setEmailHtml(html)
        setCurrentDesign(JSON.stringify(design))
        triggerSave()
      })
    })
  }

  const onReady: EmailEditorProps['onReady'] = () => {
    loadEmailDesignFromState()
  }

  const updateDesign = () => {
    const unlayer = emailEditorRef.current?.editor
    const parsedDesign =
      currentDesign && isJson(currentDesign) ? JSON.parse(currentDesign) : null
    if (parsedDesign) {
      unlayer?.loadDesign(parsedDesign)
    }
  }

  const loadEmailDesignFromState = () => {
    const unlayer = emailEditorRef.current?.editor
    const parsedDesign =
      emailDesign && emailDesign !== '{}' && isJson(emailDesign)
        ? JSON.parse(emailDesign)
        : JSON.parse(scratch)
    unlayer?.loadDesign(parsedDesign)
    setCurrentDesign(JSON.stringify(parsedDesign))
  }

  const newDesign = () => {
    const unlayer = emailEditorRef.current?.editor
    unlayer?.loadDesign(JSON.parse(scratch))
    setCurrentDesign(JSON.stringify(JSON.parse(scratch)))
  }

  useEffect(() => {
    loadEmailDesignFromState()
  }, [emailDesign])

  const formBlockJS = useMemo(() => getCustomFormBlockJS(), [])
  const formBlockCSS = useMemo(() => getSignupFormsEditorCustomCSS(), [])
  const testBlockJS = useMemo(() => getTestBlockJS(), [])

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button className="nxg-button" onClick={() => newDesign()}>
          Clear Design form
        </button>
        <button
          className="nxg-button"
          style={{ marginLeft: '8px' }}
          onClick={() => updateDesign()}
        >
          Update Design from Input
        </button>
        <button
          className="nxg-button nxg-button--primary"
          onClick={saveEmail}
          style={{ float: 'right' }}
        >
          Save Email
        </button>
      <h4>Form Editor</h4>
      </div>
      <EmailEditor
        style={{ width: '100%', height: '800px', marginBottom: '16px' }}
        ref={emailEditorRef}
        onReady={onReady}
        options={{
          projectId: parseInt(projectId),
          displayMode: 'web',
          version: '1.259.0',
          designMode: 'edit',
          customJS: [formBlockJS, testBlockJS],
          customCSS: [formBlockCSS],
          features: {
            blocks: true,
            pageAnchors: true,
            textEditor: {
                spellChecker: true,
                tables: true,
                inlineFontControls: true,
            },
            preheaderText: false,
          },
          tools: {
            my_tool: {
              position: 1,
            },
            custom_form_block: {
              position: 2,
            },
            custom_block2: {
              position: 3,
            },
            text: {
                position: 4,
            },
            heading: {
                position: 5,
            },
            image: {
                position: 6,
            },
            button: {
                position: 7,
            },
            divider: {
                position: 8,
            },
            menu: {
                position: 9,
            },
            html: {
                position: 10,
            },
            form: {
                enabled: false,
            }
        },
          appearance: {
            theme: 'modern_light',
            panels: {
              tools: {
                dock: 'left'
              }
            }
          },
          user: {
            id: 'admin_' + projectId + '_' + retoolId
          }
        }}
      />
      <div style={{ marginBottom: '16px' }}>
        <label>Email Design (JSON)</label>
        <textarea
          className="nxg-textarea"
          value={currentDesign}
          onChange={(e) => setCurrentDesign(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label>Email HTML</label>
        <textarea className="nxg-textarea" value={emailHtml} disabled={true} />
      </div>
      <div>
        <label>Email Image</label>
        <input
          type="text"
          className="nxg-text-input"
          value={emailImage}
          disabled={true}
        />
      </div>
    </div>
  )
}
