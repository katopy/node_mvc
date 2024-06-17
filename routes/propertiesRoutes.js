import express from 'express'
import {admin} from '../controllers/propertyController.js'

const router = express.Router();

router.get('/my-properties', admin)


export default router