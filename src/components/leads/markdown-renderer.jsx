/* eslint-disable no-unused-vars */
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw";


export default function MarkDownRender({ markdownContent }) {
    return (
        <div className="container mx-auto">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <SyntaxHighlighter
                                {...props}
                                // children={String(children).replace(/\n$/, '')}
                                // style={atomDark}
                                language={match[1]}
                                PreTag="div"
                            />
                        ) : (
                            <code {...props} className={className}>
                                {children.replaceAll("\n", "<br>")}
                            </code>
                        )
                    },
                    table: ({ node, ...props }) => <table className="border-collapse table-auto w-full  text-sm" {...props} />,
                    th: ({ node, ...props }) => <th className="border-b  font-medium p-2 pl-8 pt-0 pb-3   text-left" {...props} />,
                    td: ({ node, ...props }) => <td className="border-b border-slate-100  p-4 pl-8  " {...props} />,
                    p: ({ node, ...props }) => <p className="text-base " {...props} />,
                }}
            >
                {markdownContent}
            </ReactMarkdown>
        </div>
    )
}

