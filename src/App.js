import React from 'react';
import './App.css';
import ComplexFilters from './complexfilters'

class App extends React.Component {
    render() {
        //variable storage of initial grammar options
        const options = {
            startNode: 'queryStart',
            grammar: {
                'queryStart': {
                    label: false,
                    children: ['$Columns'],
                    widget: 'textWidget'
                },
                'time': {
                    label: 'Time Column',
                    field: 'column',
                    group: 'Columns',
                    children: ['$Operators'],
                    widget: 'textWidget'
                },
                'text': {
                    label: 'Text Column',
                    field: 'column',
                    group: 'Columns',
                    children: ['$Operators'],
                    widget: 'textWidget'
                },
                'key-value': {
                    label: 'Key Value Column',
                    field: 'column',
                    group: 'Columns',
                    children: ['$Keys'],
                    widget: 'textWidget'
                },
                'key': {
                    label: 'Key',
                    field: 'key',
                    group: 'Keys',
                    children: ['$Operators'],
                    widget: 'textWidget'
                },
                'eq': {
                    label: '&#61;',
                    field: 'operator',
                    group: 'Operators',
                    children: ['value'],
                    widget: 'textWidget'
                },
                'neq': {
                    label: '&#8800;',
                    field: 'operator',
                    group: 'Operators',
                    children: ['value'],
                    widget: 'textWidget'
                },
                'value': {
                    label: false,
                    field: 'value',
                    validator: function (value) {
                        return true;
                    },
                    final: true,
                    children: ['queryStart']
                }
            },
            validateGrammar: function (options) {
                try {
                    var opratorState = options.inputState[options.inputState.length - 1];
                    var columnState = options.inputState[options.inputState.length - 2];
                    if (columnState) {
                        var opratorNode = options.grammar[opratorState.key];
                        if (columnState.key == 'time') {
                            opratorNode.widget = 'timeWidget';
                        } else {
                            opratorNode.widget = 'textWidget';

                        }
                    }
                } catch (err) {
                    console.log(err);
                }
                return options.grammar;
            }
        };
        return (
            <div className="App">
                <div className="title-box">
                    <h1>Complex Filters</h1>
                    <h3>React autocomplete your grammar</h3>
                </div>
                <form id="main-form" action="" method="post">
                    {/*<label>*/}
                    {/*  filter:*/}
                    {/*</label>*/}
                    {/*<input type="text" id="filter" name="filter"/>*/}
                    {/*<input type="submit" value="Submit" />*/}

                    {/*ComplexFilter component render here
                        props: grammar variable */}
                    <ComplexFilters options={options} />
                </form>
            </div>
        );
    }

}

export default App;
