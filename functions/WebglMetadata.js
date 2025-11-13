/*
# Aura

Copyright © 2025 Litebrowsers
Licensed under a Proprietary License

This software is the confidential and proprietary information of Litebrowsers
Unauthorized copying, redistribution, or use is prohibited.
For licensing inquiries, contact:
vera cohopie at gmail dot com
thor betson at gmail dot com
*/

export default function () {
    return new Promise((resolve) => {
        Promise.all([
            getWebgl('webgl'),
            getWebgl('webgl2')
        ]).then(response => {
            const webgl = response[0]
            const webgl2 = response[1]

            resolve({
                webglAdapterVendor: webgl ? (webgl.vendor) : undefined,
                webglAdapterRenderer: webgl ? (webgl.renderer) : undefined,
                webgl2AdapterVendor: webgl2 ? (webgl2.vendor) : undefined,
                webgl2AdapterRenderer: webgl2 ? (webgl2.renderer) : undefined,
                protocolVersion: 1
            })
        })
    })
}

function getWebgl(type) {
    return new Promise(resolve => {
        if (type === 'webgl' && !('WebGLRenderingContext' in window)) {
            return resolve(undefined)
        } else if (type === 'webgl2' && !('WebGL2RenderingContext' in window)) {
            return resolve(undefined)
        }

        let canvas, context
        try {
            canvas = document.createElement('canvas')
            context = canvas.getContext(type) || canvas.getContext('experimental-' + type)
            if (!context) return resolve(undefined)
        } catch (error) {
            return resolve(undefined)
        }

        const getUnmasked = (ctx, name) => {
            const ext = ctx.getExtension('WEBGL_debug_renderer_info')
            return ext ? ctx.getParameter(ext[name]) : undefined
        }

        const vendor = getUnmasked(context, 'UNMASKED_VENDOR_WEBGL')
        const renderer = getUnmasked(context, 'UNMASKED_RENDERER_WEBGL')

        resolve({ vendor, renderer })
    })
}
