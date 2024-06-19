const admin = (req, res) => {
    res.render('properties/admin',{
        pagina: 'My properties',
        bar: true
    })
}

const create = (req, res) => {
    res.render('properties/create', {
        pagina: 'Create Property'
    })

}

export {
    admin, 
    create
}