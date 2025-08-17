import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import {Button, Card, Row, Col} from 'react-bootstrap'

const Entry = ({entryData, setChangeIngredient, deleteSingleEntry, handleEditEntry}) => {
    if (!entryData) {
        return null;
    }

    const changeIngredient = () => {
        setChangeIngredient({
            "change": true,
            "id": entryData._id
        })
    }

    const changeEntry = () => {
        handleEditEntry(entryData)
    }

    return(
        <Card className="mb-3">
            <Card.Body>
                <Row>
                    <Col>Dish: {entryData.dish || 'N/A'}</Col>
                    <Col>Ingredients: {entryData.ingredients || 'N/A'}</Col>
                    <Col>Calories: {entryData.calories || 0}</Col>
                    <Col>Fat: {entryData.fat || 0}</Col>
                    <Col>
                        <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => deleteSingleEntry(entryData._id)}
                        >
                            Delete Entry
                        </Button>
                    </Col>
                    <Col>
                        <Button 
                            variant="warning" 
                            size="sm" 
                            onClick={changeIngredient}
                        >
                            Change Ingredients
                        </Button>
                    </Col>
                    <Col>
                        <Button 
                            variant="info" 
                            size="sm" 
                            onClick={changeEntry}
                        >
                            Change Entry
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}

export default Entry