// src/components/posts/editor/extensions/EmbedExtension.ts

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface EmbedOptions {
  HTMLAttributes: Record<string, any>
}

export const EmbedExtension = Extension.create<EmbedOptions>({
  name: 'embed',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('embed'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const { doc } = state

            doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text || ''
                
                // Match YouTube URLs
                const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
                let match
                while ((match = youtubeRegex.exec(text)) !== null) {
                  const start = pos + match.index
                  const end = start + match[0].length
                  const videoId = match[4]
                  
                  decorations.push(
                    Decoration.widget(end, () => {
                      const iframe = document.createElement('iframe')
                      iframe.src = `https://www.youtube.com/embed/${videoId}`
                      iframe.width = '560'
                      iframe.height = '315'
                      iframe.frameBorder = '0'
                      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      iframe.allowFullscreen = true
                      
                      return iframe
                    })
                  )
                }
                
                // Match Twitter URLs
                const twitterRegex = /(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/([0-9]+)/g
                while ((match = twitterRegex.exec(text)) !== null) {
                  const start = pos + match.index
                  const end = start + match[0].length
                  const tweetId = match[5]
                  
                  decorations.push(
                    Decoration.widget(end, () => {
                      const blockquote = document.createElement('blockquote')
                      blockquote.className = 'twitter-tweet'
                      blockquote.setAttribute('data-tweet-id', tweetId)
                      
                      const script = document.createElement('script')
                      script.src = 'https://platform.twitter.com/widgets.js'
                      script.async = true
                      
                      document.body.appendChild(script)
                      
                      return blockquote
                    })
                  )
                }
              }
              return true
            })
            
            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})