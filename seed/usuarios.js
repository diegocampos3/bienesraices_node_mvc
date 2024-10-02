import bcrypt from 'bcrypt'


const usuarios = [
    {
        nombre: 'diego',
        email: 'diegoc33@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('diego123', 10)
    },
    {
        nombre: 'juan',
        email: 'juanc33@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('juan123', 10)
    },
    {
        nombre: 'jean',
        email: 'jeanc33@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('jean123', 10)
    }
]


export default usuarios