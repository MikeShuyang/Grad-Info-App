import React, { useState } from 'react'
import { Table, Input, Button, Modal, Form, DatePicker, Select, message} from 'antd';
import 'antd/dist/antd.less';
import { useSelector } from 'react-redux';
import {UserInfo,AccessPostNumberList} from '../../Redux/Slices/UserInfo'
import { StudentPostNumber, StudentID} from '../../Redux/Slices/StudentInfo'
import style from './DataTable.module.less'
import moment from 'moment';
import { NonCourseRelatedEventDataModel } from '../../Model/nonCourseRelatedEvent/NonCourseRelatedEventDataModel';
import {postNonCourseRelatedEventTableDataByEventObj} from '../../Api/nonCourseRelatedEvent'
import SubmitConfirm from '../../Utility/PostConfirm/SubmitConfirm/SubmitConfirm'
import PostNumberAccess from '../CommonFunc/PostNumberAccess'
function EventDataTable(props) {
    var {tableData, columns,eventList,mainPageShouldRefresh} = props;
    const curUserInfo = useSelector(UserInfo);
    const curStudentPostNumber = useSelector(StudentPostNumber);
    const curStudentID = useSelector(StudentID);
    const accessPostNumberList = useSelector(AccessPostNumberList);
    const functionDisable = PostNumberAccess(accessPostNumberList, curStudentPostNumber);
    var EventListOption = [];
    for(let i = 0; i < eventList.length; i++){
        EventListOption.push(eventList[i].code + " : " + eventList[i].description);
    }
    const [isAddModalVisible, setisAddModalVisible] = useState(false);
    const [code, setCode] = useState(""); 
    const [description, setDescription] = useState("");
    const [format, setFormat] = useState("NONE");
    const [relatedYear, setRelatedYear] = useState("");
    const [relatedSemster, setRelatedSemster] = useState(null);
    const [units, setUnits] = useState(null);
    const [freeForm, setFreeForm] = useState("");
    const [eventDate, setEventDate] = useState("");
    const cleanState = () =>{
        setCode("");
        setDescription("");
        setRelatedSemster(null);
        setRelatedYear("");
        setUnits(null);
        setFreeForm("");
        setEventDate("");
    }
    const handleAdd = () =>{
        setisAddModalVisible(true);
    }
    const handleAddModalOk = () =>{
        let curRelated = "";
        if(format === "TERM"){
            curRelated = `${moment(relatedYear).format("YYYY")}${relatedSemster}`;
        }
        else if(format === "UNITS"){
            curRelated = units;
        }
        else{
            curRelated = freeForm;
        }
        let obj = {
            code : code,
            description : description,
            related : curRelated,
            date : moment(eventDate).format("MM/DD/YYYY"),
            transactiondate : moment().format("MM/DD/YYYY"),
            oper: curUserInfo.useroper
        }
        if(!code || !curRelated || !eventDate){
            message.warning("You must add all of items!",1);
            return;
        }
        const studentInfoObj = {
            id : curStudentID,
            studentPostNumber: curStudentPostNumber
        }
        let dataObject = NonCourseRelatedEventDataModel.NonCourseRelatedEventDataModelSubmitDataObj(obj,studentInfoObj);
        let ConfrimProps = {
            content: `One event will be added.`,
            responseDataModelFun : NonCourseRelatedEventDataModel.NonCourseRelatedEventDataModelResponseDataObj,
            requestBody : dataObject,
            fetchDataFun: postNonCourseRelatedEventTableDataByEventObj,
            mainPageShouldRefresh,
            formDisapperFun : handleAddModalCancel
        }

        SubmitConfirm({...ConfrimProps});
    }
    const handleAddModalCancel = () =>{
        cleanState();
        setisAddModalVisible(false);
    }
    const handleCodeChange = (value) =>{
        let dataArr = value.split(":");
        let code = dataArr[0].substring(0, dataArr[0].length - 1);
        let description = dataArr[1].substring(1, dataArr[1].length);
        setCode(code);
        setDescription(description);
        for(let i = 0; i < eventList.length; i++){
            if(code === eventList[i].code){
                setFormat(eventList[i].format);
                break;
            }
        }
    }
    const filterAddEventOption = (input, option) =>{
        return option.children.toLowerCase().indexOf(input.toLowerCase()) === 0
    }
    const AddModalForm = () => {
        const selectEventOption = EventListOption.map((item) => {
            return (
                <Select.Option key = {item} value = {item}>{item}</Select.Option>
            )
        })
        let semster = [1,2,3];
        const selectSemsterOption = semster.map((item) => {
            return (
                <Select.Option key = {item + "semster"} value = {item}>{item}</Select.Option>
            )
        });
        const selectRelatedYearAndSemster = () => {
            return (
                <Form.Item>
                    <DatePicker
                        allowClear = {false}
                        placeholder = "Year"
                        style={{ width: 120 }}
                        value={ !relatedYear ? moment("").valueOf() : moment(relatedYear)}
                        onChange = {(value) => setRelatedYear(moment(value).valueOf())}
                        picker="year"/>
                    <Select
                        style={{ width: 100 }}
                        placeholder="Semster"
                        value={relatedSemster}
                        onChange = {(value) => setRelatedSemster(value)}
                    >
                    {selectSemsterOption}
                    </Select>   
                </Form.Item>   
            )
        }
        const selectRelatedUnits = () => {
            return (
                <Form.Item
                    name="units"
                    rules={[
                        {
                            pattern : /^\d+(.\d{1,2})?$/,
                            message : 'You should input a number(up to two decimal places) '
                        }
                    ]}
                >
                    <Input placeholder = "Please input units" value={units} onChange={(value)=>{setUnits(value)}}/>
                </Form.Item>            
            )
        }
        const selectFreeForm = () => {
            return (
                <Form.Item
                    name="freeForm"
                    rules={[
                        {
                            type: 'string',
                            max : 36,
                            message : 'You can input anything(Max length is 36)'
                        }
                    ]}
                >
                    <Input placeholder = "Please input anything" value={freeForm} onChange={(value)=>{setFreeForm(value)}}/>
                </Form.Item>            
            )
        }
        const selectRelated = () => {
            if(format === "TERM"){
                return selectRelatedYearAndSemster();
            }
            else if(format === "UNITS"){
                return selectRelatedUnits();
            }
            else{
                return selectFreeForm();
            }
        }
        return (
            <Form
                labelCol={{
                    span: 5,
                }}
                wrapperCol={{
                    span: 14,
                }}
                layout="horizontal"
            >
            <Form.Item label="Code">
              <Select 
                showSearch
                value = {code}
                filterOption = {filterAddEventOption}
                onChange = {handleCodeChange}>
                {selectEventOption}
              </Select>
            </Form.Item>
            <Form.Item label="Description">
              <Input key = {description} value = {description}></Input>
            </Form.Item>
            <Form.Item style = {{marginBottom:0}} label="Related">
               {selectRelated()}
            </Form.Item>
            <Form.Item label="Date">
              <DatePicker 
                value={ !eventDate ? moment("").valueOf() : moment(eventDate)}
                allowClear = {false}
                onChange={(value) => {setEventDate(moment(value).valueOf())}}/>
            </Form.Item>
          </Form>
        )
    }
    return (
            <div>
                <Button
                    disabled = {functionDisable}
                    onClick={() => handleAdd()}
                    className={[style.button, style.topButton]}
                    >
                    ADD EVENT
                </Button>
                <Modal 
                    key = "addEvent"
                    centered
                    visible={isAddModalVisible} 
                    onCancel = {handleAddModalCancel}
                    onOk = {handleAddModalOk}
                    maskClosable = {false}
                    title = {[
                        <div key = "addEventTitle" className = {style.modalTitle} >ADD EVENT</div>
                    ]}
                    footer={[
                        <Button  key = "addEventCancel" onClick = {handleAddModalCancel}>
                            Cancel
                        </Button>,
                        <Button key="addEventOk" type="primary" onClick={handleAddModalOk}>
                            Submit  
                        </Button>,]}
                    >
                    {AddModalForm()}
                </Modal>
                <Table
                    key = "EventTable"
                    className = {style.header}
                    columns = {columns}
                    dataSource = {tableData}
                >
                </Table>                         
            </div>
            
    )
}

export default React.memo(EventDataTable);