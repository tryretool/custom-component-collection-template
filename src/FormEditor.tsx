import { useEffect, useRef, useState } from 'react'
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor'
import { Retool } from '@tryretool/custom-component-support'
import { scratch } from './email-templates/scratch'
import { registerHelloWorldTool } from './unlayer-tools/hello-world-tool'


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

  const onReady: EmailEditorProps['onReady'] = (editor) => {
    // registerHelloWorldTool(editor)
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
          customJS: ["//cdn.muicss.com/mui-0.9.28/js/mui.min.js"],
          customCSS: [],
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
            hello_world: {
              position: 2,
            },
            custom_form_block: {
              position: 3,
            },
            custom_block2: {
              position: 4,
            },
            text: {
                position: 5,
            },
            heading: {
                position: 6,
            },
            image: {
                position: 7,
            },
            button: {
                position: 8,
            },
            divider: {
                position: 9,
            },
            menu: {
                position: 10,
            },
            html: {
                position: 11,
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
