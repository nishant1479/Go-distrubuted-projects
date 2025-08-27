import React, {useState, useEffect, useCallback} from 'react';
import axios from "axios";
import {Button, Form, Container, Modal, Alert} from 'react-bootstrap'
import Entry from './single-entry.component';

const Entries = () => {
    const [entries, setEntries] = useState([])
    const [refreshData, setRefreshData] = useState(false)
    const [changeEntry, setChangeEntry] = useState({"change": false, "id": 0})
    const [changeIngredient, setChangeIngredient] = useState({"change": false, "id": 0})
    const [newIngredientName, setNewIngredientName] = useState("")
    const [addNewEntry, setAddNewEntry] = useState(false)
    const [newEntry, setNewEntry] = useState({"dish":"", "ingredients":"", "calories":0, fat:0})
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const getAllEntries = useCallback(async () => {
        try {
            setLoading(true)
            setError("")
            const url = "http://localhost:8000/entries"
            const response = await axios.get(url, {
                responseType: 'json'
            })
            if(response.status === 200){
                setEntries(response.data)
            }
        } catch (err) {
            setError("Failed to fetch entries: " + (err.response?.data?.message || err.message))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        getAllEntries();
    }, [getAllEntries])

    useEffect(() => {
        if(refreshData){
            setRefreshData(false);
            getAllEntries();
        }
    }, [refreshData, getAllEntries])

    const handleNewEntryChange = (field, value) => {
        setNewEntry(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleEditEntry = (entryData) => {
        setNewEntry({
            dish: entryData.dish || "",
            ingredients: entryData.ingredients || "",
            calories: entryData.calories || 0,
            fat: entryData.fat || 0
        })
        setChangeEntry({"change": true, "id": entryData._id})
    }

    const changeIngredientForEntry = async () => {
        // Validate required field
        if (!newIngredientName.trim()) {
            setError("Please enter new ingredients")
            return
        }

        try {
            setError("")
            const url = "http://localhost:8000/ingredient/update/" + changeIngredient.id
            const response = await axios.put(url, {
                "ingredients": newIngredientName.trim()
            })
            if(response.status === 200){
                setChangeIngredient({"change": false, "id": 0})
                setNewIngredientName("")
                setRefreshData(true)
            }
        } catch (err) {
            setError("Failed to update ingredient: " + (err.response?.data?.message || err.message))
        }
    }

    const changeSingleEntry = async () => {
        // Validate required fields
        if (!newEntry.dish.trim() || !newEntry.ingredients.trim() || newEntry.calories <= 0) {
            setError("Please fill in all required fields (Dish, Ingredients, and Calories must be greater than 0)")
            return
        }

        try {
            setError("")
            const url = "http://localhost:8000/entry/update/" + changeEntry.id
            const response = await axios.put(url, {
                "ingredients": newEntry.ingredients.trim(),
                "dish": newEntry.dish.trim(),
                "calories": newEntry.calories,
                "fat": parseFloat(newEntry.fat) || 0
            })
            if(response.status === 200){
                setChangeEntry({"change": false, "id": 0})
                setNewEntry({"dish":"", "ingredients":"", "calories":0, fat:0})
                setRefreshData(true)
            }
        } catch (err) {
            setError("Failed to update entry: " + (err.response?.data?.message || err.message))
        }
    }

    const addSingleEntry = async () => {
        // Validate required fields
        if (!newEntry.dish.trim() || !newEntry.ingredients.trim() || newEntry.calories <= 0) {
            setError("Please fill in all required fields (Dish, Ingredients, and Calories must be greater than 0)")
            return
        }

        try {
            setError("")
            setAddNewEntry(false)
            const url = "http://localhost:8000/entry/create"
            const response = await axios.post(url, {
                "ingredients": newEntry.ingredients.trim(),
                "dish": newEntry.dish.trim(),
                "calories": newEntry.calories,
                "fat": parseFloat(newEntry.fat) || 0
            })
            if(response.status === 200){
                setNewEntry({"dish":"", "ingredients":"", "calories":0, fat:0})
                setRefreshData(true)
            }
        } catch (err) {
            setError("Failed to add entry: " + (err.response?.data?.message || err.message))
        }
    }
    
    const deleteSingleEntry = async (id) => {
        try {
            setError("")
            const url = "http://localhost:8000/entry/delete/" + id
            const response = await axios.delete(url)
            if (response.status === 200){
                setRefreshData(true)
            }
        } catch (err) {
            setError("Failed to delete entry: " + (err.response?.data?.message || err.message))
        }
    }

    return(
        <div>
            <Container>
                {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Button onClick={() => setAddNewEntry(true)} disabled={loading} variant="primary">
                        {loading ? 'Loading...' : "Track today's calories"}
                    </Button>
                    {loading && <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>}
                </div>
            </Container>
            <Container>
                {loading && <p>Loading entries...</p>}
                {entries && entries.length > 0 && entries.map((entry, i) => (
                    <Entry 
                        key={entry._id || i} 
                        entryData={entry} 
                        deleteSingleEntry={deleteSingleEntry} 
                        setChangeIngredient={setChangeIngredient} 
                        handleEditEntry={handleEditEntry} 
                    />
                ))}
                {!loading && entries && entries.length === 0 && <p>No entries found.</p>}
            </Container>

            <Modal show={addNewEntry} onHide={() => setAddNewEntry(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Calorie Entry</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Dish *</Form.Label>
                        <Form.Control 
                            value={newEntry.dish}
                            onChange={(event) => handleNewEntryChange('dish', event.target.value)}
                            required
                            placeholder="Enter dish name"
                        />
                        <Form.Label>Ingredients *</Form.Label>
                        <Form.Control 
                            value={newEntry.ingredients}
                            onChange={(event) => handleNewEntryChange('ingredients', event.target.value)}
                            required
                            placeholder="Enter ingredients"
                        />
                        <Form.Label>Calories *</Form.Label>
                        <Form.Control 
                            type="number"
                            min="0"
                            value={newEntry.calories}
                            onChange={(event) => handleNewEntryChange('calories', parseInt(event.target.value) || 0)}
                            required
                            placeholder="Enter calories"
                        />
                        <Form.Label>Fat (g)</Form.Label>
                        <Form.Control 
                            type="number" 
                            min="0"
                            step="0.1"
                            value={newEntry.fat}
                            onChange={(event) => handleNewEntryChange('fat', parseFloat(event.target.value) || 0)}
                            placeholder="Enter fat content"
                        />
                    </Form.Group>
                    <div className="mt-3">
                        <Button onClick={addSingleEntry} variant="primary" className="me-2">Add</Button>
                        <Button onClick={() => setAddNewEntry(false)} variant="secondary">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={changeIngredient.change} onHide={() => setChangeIngredient({"change": false, "id":0})} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Ingredients</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>New ingredients *</Form.Label>
                        <Form.Control 
                            value={newIngredientName}
                            onChange={(event) => setNewIngredientName(event.target.value)}
                            required
                            placeholder="Enter new ingredients"
                        />
                    </Form.Group>
                    <div className="mt-3">
                        <Button onClick={changeIngredientForEntry} variant="primary" className="me-2">Change</Button>
                        <Button onClick={() => setChangeIngredient({"change": false, "id":0})} variant="secondary">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={changeEntry.change} onHide={() => setChangeEntry({"change": false, "id":0})} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Entry</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Dish *</Form.Label>
                        <Form.Control 
                            value={newEntry.dish}
                            onChange={(event) => handleNewEntryChange('dish', event.target.value)}
                            required
                            placeholder="Enter dish name"
                        />
                        <Form.Label>Ingredients *</Form.Label>
                        <Form.Control 
                            value={newEntry.ingredients}
                            onChange={(event) => handleNewEntryChange('ingredients', event.target.value)}
                            required
                            placeholder="Enter ingredients"
                        />
                        <Form.Label>Calories *</Form.Label>
                        <Form.Control 
                            type="number"
                            min="0"
                            value={newEntry.calories}
                            onChange={(event) => handleNewEntryChange('calories', parseInt(event.target.value) || 0)}
                            required
                            placeholder="Enter calories"
                        />
                        <Form.Label>Fat (g)</Form.Label>
                        <Form.Control 
                            type="number" 
                            min="0"
                            step="0.1"
                            value={newEntry.fat}
                            onChange={(event) => handleNewEntryChange('fat', parseFloat(event.target.value) || 0)}
                            placeholder="Enter fat content"
                        />
                    </Form.Group>
                    <div className="mt-3">
                        <Button onClick={changeSingleEntry} variant="primary" className="me-2">Change</Button>
                        <Button onClick={() => setChangeEntry({"change": false, "id":0})} variant="secondary">Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div> 
    );
}

export default Entries