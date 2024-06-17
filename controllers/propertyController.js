const admin = (req, res) => {
    res.render('properties/admin',{
        pagina: 'My properties'
    })
    
}

export {
    admin
}