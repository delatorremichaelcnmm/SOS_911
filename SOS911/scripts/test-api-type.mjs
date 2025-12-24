import api from '../front_sos911/src/services/api.js'

console.log('api.get:', typeof api.get)
console.log('api.post:', typeof api.post)
console.log('Looks like axios-style instance (has defaults):', !!api.defaults)
