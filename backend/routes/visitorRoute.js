import express from 'express';
import Visitor from '../models/visitorModel.js';
import bcrypt from 'bcrypt';
import multer from 'multer';

const router = express.Router();
const upload = multer(); 

// route for add visitor
router.post('/register', upload.single('photo'), async (request, response) => {
    try {
        const { name, nic, email, password, contactNumber, hostName } = request.body;
        const photo = request.file ? request.file.buffer : null;

        if (!name || !nic || !email || !password || !contactNumber) {
            return response.status(400).send({ message: "Missing required fields" });
        }

        // Check for existing NIC or email
        const existingVisitorNIC = await Visitor.findOne({ nic });
        if (existingVisitorNIC) {
            return response.status(409).send({ message: 'NIC already registered.' });
        }
        const existingVisitorEmail = await Visitor.findOne({ email });
        if (existingVisitorEmail) {
            return response.status(409).send({ message: 'Email already registered.' });
        }



        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newVisitor = new Visitor({
            name,
            nic,
            email,
            password: hashedPassword,
            contactNo: parseInt(contactNumber),
            hostName,
            photo,
        });

        const savedVisitor = await newVisitor.save();
        return response.status(201).json(savedVisitor);
    } catch (error) {
        console.error('registering visitor unsuccessful:', error);
        return response.status(500).send({ message: error.message });
    }
});



// Route for update visitor
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, nic, email, password, contactNo, hostName } = req.body;

        if (!name || !nic || !email || !contactNo) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        const updateData = {
            name,
            nic,
            email,
            contactNo,
            hostName
        };

        // Only update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedVisitor = await Visitor.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedVisitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        return res.status(200).send({ message: 'Visitor updated successfully' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({ message: error.message });
    }
});




// Route for delete visitor
router.delete('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const deletedVisitor = await Visitor.findByIdAndDelete(id);

        if (!deletedVisitor) {
            return response.status(404).json({ message: "Visitor not found" });
        }

        return response.status(200).json({ message: "Visitor deleted successfully" });
    } catch (error) {
        console.error(error.message);
        return response.status(500).send({ message: error.message });
    }
});




// Route for get all visitors
router.get('/', async (request, response) => {
    try {
        const visitors = await Visitor.find({});
        const visitorsWithPhotos = visitors.map(visitor => {
            if (visitor.photo) {
                return {
                    ...visitor._doc,
                    photoBase64: `data:image/jpeg;base64,${visitor.photo.toString('base64')}` 
                };
            }
            return visitor._doc;
        });
        return response.status(200).json(visitorsWithPhotos);
    } catch (error) {
        console.error(error.message);
        response.status(500).send({ message: error.message });
    }
});






// Route for get one visitor
router.get('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const visitor = await Visitor.findById(id);

        if (!visitor) {
            return response.status(404).json({ message: "Visitor not found" });
        }

        return response.status(200).json(visitor);
    } catch (error) {
        console.error(error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;