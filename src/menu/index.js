const {
    addAngularFileHandle
} = require('./handle')

const menus = [
    {
        command: "extension.addAngularPage",
        handle: addAngularFileHandle
    },
    {
        command: "extension.addAngularComponent",
        handle: addAngularFileHandle
    },
    {
        command: "extension.addAngularDirective",
        handle: addAngularFileHandle
    },
    {
        command: "extension.addAngularPipe",
        handle: addAngularFileHandle
    },
    {
        command: "extension.addAngularService",
        handle: addAngularFileHandle
    },
    {
        command: "extension.addAngularRoute",
        handle: addAngularFileHandle
    },
    {
        command: "extension.addAngularModule",
        handle: addAngularFileHandle
    }
]

module.exports = {
    menus
}