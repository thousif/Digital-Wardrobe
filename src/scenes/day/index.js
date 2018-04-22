import React, { Component } from 'react'
import { List, 
	Avatar, 
	Button, 
	Spin, 
	Upload, 
	Icon, 
	Modal , 
	Layout, 
	Menu,
	message, 
	DatePicker,
	Tooltip,
	Form,
	Row,
	Col,
	Input,
	Checkbox,
	Radio,
	notification,
	Select } from 'antd'
import moment from 'moment'
import '../../styles/index.css'
const { Header, Footer, Content } = Layout;
const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae','#FF3333','#97AF83','#8FCCFF','#8F00F8','#FF5FC6','#B03060'];
const FormItem = Form.Item;
const Option = Select.Option;

const days = ['All','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

class AppForm extends Component {
  constructor(props){
    super(props);
    console.log(this.props);
    console.log("week component");
    this.state =  {
	    theme : colorList[this.getRandomInt()],
	    day : this.props.params.day, 
	    previewVisible: false,
	    previewImage: '',
	    previewDetails : false,
	    previewOutfitSelector : false,
	    fileList: [],
	    allFiles : [],
	    file : {}
	}
  }

  getRandomInt = () => {
	  return Math.floor(Math.random() * Math.floor(9));
  }

  componentDidMount() {
    // lets start
    // check if there is an existing database and update state .
    let {day} = this.state;
    console.log(days.indexOf(day))
    if(days.indexOf(day) < 0 ){
    	message.error("No such day exists");
    	return
    }
	this.getStore(day);
  }

  getStore = (day) => {
  	console.log("fetching all stored images");
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    message.error("Your browser does not support this feature. please update to access.");
	    return;
	}

	// passing state to local scope 
	const self = this;

	const open = indexedDB.open('myDatabase', 5);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("wardrobe5", {keyPath: "id"});
	    var index = store.createIndex("days" , "days" , {unique : false,multientry : true});
		store.createIndex("id","id", { unique : true });
	};

  	open.onerror = (err) => {
	    message.error("Error fetching data.");
  		console.log(err);
  	}

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("wardrobe5", "readwrite");
	    var store = tx.objectStore("wardrobe5");
	    var index = store.index("id");
	    var indexByDay = store.index("days");

	    var getAllByDay = indexByDay.getAll(day);
	    
	    var getAll = index.getAll();

	    console.log('check');
	    
	    getAllByDay.onsuccess = function() {
	    	console.log(getAllByDay);
	    	//updating state with data retrieved from database
	   		if(getAllByDay.result && getAllByDay.result.length >= 0){
	   			let fileList = getAllByDay.result.map(data => data.uri);
	   			self.setState({
	   				...self.state,
	   				fileList
	   			})
	   		}
	    };

	    getAll.onsuccess = function() {
	   		if(getAll.result && getAll.result.length >= 0){
	   			console.log('getAll',getAll);
	   			let allFiles = getAll.result.filter(file => file.days.indexOf(day) < 0).map(data => data.uri)
	   			self.setState({
	   				...self.state,
	   				allFiles,
	   				allFilesRaw : getAll.result
	   			})
	   		}
	    }

	    getAll.onerror = function() {
	    	message.error("Error! Try again later");
	    	console.log(getAll.error);
	    }

	    getAllByDay.onerror = function() {
	    	message.error("Error! Try again later");
	    	console.log(getAll.error);
	    }

	    // closing db connection
	    tx.oncomplete = function() {
	        db.close();
	    };
	}		
  }

  confirm = (file) => {
  	this.setState({
  		previewDetails : true,
  		file,
  	})
  }

  handleOutfitSelectorOk = (e) => {
  	e.preventDefault();
  	this.props.form.validateFields((err,values) => {
  		console.log(values);
  		this.updateDB(values.outfits);
  		this.setState({
  			previewOutfitSelector : false,
  		})
  		this.props.form.resetFields();
  	})
  }

  updateDB = (outfits) => {
  	console.log(outfits);

  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    message.error("Your browser does not support this feature. please update to access.");
	    return;
	}

	// passing state to local scope 
	const self = this;

	const open = indexedDB.open('myDatabase', 5);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("wardrobe5", {keyPath: "id"});
	  	store.createIndex("id","id", {unique : true});
	    var index = store.createIndex("days" , "days" , {unique : false,multientry : true});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("wardrobe5", "readwrite");
	    var store = tx.objectStore("wardrobe5");
	    
	    console.log(self.state);
	    let allFiles  = self.state.allFilesRaw;
	    let i = 0;
	    console.log('allFiles', allFiles, outfits);
	    putNext();

	    function putNext() {
	    	console.log(i,outfits.length);
	    	if (i<outfits.length) {
                var file = allFiles.find(file => file.id == outfits[i])
                file.days.push(self.state.day);
                store.put(file).onsuccess = putNext;
                ++i;
            } else {   // complete
                console.log('populate complete');
		        self.getStore(self.state.day);
            }
	    }

	    db.onerror = function() {
	    	message.error("Error saving .")
	    	console.log(db.error);
	    }

	    tx.oncomplete = function() {
	        db.close();
	    };
	}
  }

  storeToDB = (file,day) => {
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    message.error("Your browser does not support this feature. please update to access.");
	    return;
	}

	// passing state to local scope 
	const self = this;

	file = {
		...file,
		status : 'done'
	}
	
	const open = indexedDB.open('myDatabase', 2);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("OutfitStore", {keyPath: "id"});
	    var index = store.createIndex("day" , "day" , {unique : false});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("OutfitStore", "readwrite");
	    var store = tx.objectStore("OutfitStore");
	    var index = store.index("day");

	    store.put({id: file.uid , uri : file , day : day || self.state.day});

	    var saveImage = index.get(file.uid);

	    saveImage.onsuccess = function() {
	    	
	    	message.success("Successfully uploaded the image.")

	    	let {fileList} = self.state;

			let target = fileList.findIndex(f => f.uid == file.uid);

			if(target >= 0){
				fileList[target] = file;
				self.setState({
					...this.state,
					fileList
				})
			} else {
				console.log("Invalid target id");
			}

	    };

	    saveImage.onerror = function() {
	    	message.error("Error uploading the image.")
	    	console.log(saveImage.error);
	    }

	    tx.oncomplete = function() {
	        db.close();
	    };
	}		
  }

  removeFromDay = (file) => {
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    message.error("Your browser does not support this feature. please update to access.");
	    return;
	}

	const self = this;
	
	const open = indexedDB.open('myDatabase', 5);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("wardrobe5", {keyPath: "id"});
	    store.createIndex("id","id",{unique : true});
	    store.createIndex("days" , "days" , {unique : false,multientry : true});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("wardrobe5", "readwrite");
	    var store = tx.objectStore("wardrobe5");
	    
	    let allFiles  = self.state.allFilesRaw;

        var fileToBeRemoved = allFiles.find(f => f.id === file.uid)

        if(fileToBeRemoved){
        	let { days } = fileToBeRemoved;
        	if(days && days.length > 0){
        		fileToBeRemoved.days = days.filter(day => day != self.state.day);
        	}

			var update = store.put(fileToBeRemoved);

			update.onsuccess = function() {
				message.success("Successfully removed from "+ self.state.day);
			}

			update.onerror = function() {
				message.error(" Error removing this image");
			}        	

        } else {
        	return
        }

	    tx.oncomplete = function() {
	        db.close();
	    };
	}	
  }


  handleCancel = () => this.setState({ previewVisible: false })
  
  handleOutfitSelectorCancel = () => this.setState({ previewOutfitSelector : false })

  openOutfitSelector = () => this.setState({ previewOutfitSelector : true })

  handleRemove = (file) => {
  	let {fileList} = this.state;
  	fileList = fileList.filter(f => f.uid != file.uid);
  	this.removeFromDay(file);
  	this.setState({fileList})
  }

  handleDayChange = (day) => {
  	if(day === 'All'){
  		this.props.router.push('/');
  		return
  	}
  	this.props.router.push('/week/'+day); 
  	this.setState({day},function(){
  		this.getStore(day);
  	})
  }

  previousDay = () => {
  	let theme = colorList[this.getRandomInt()]
  	let prevDay = days.indexOf(this.state.day);
  	
  	if(prevDay < 0) return;
  	else if(prevDay === 0) prevDay = days.length-2;
  	else prevDay--;

  	this.setState({
  		theme,
	    day : days[prevDay]
  	},function(){
  		this.props.router.push('/week/'+this.state.day);
  		this.getStore(this.state.day)
  	})
  }

  nextDay = () => {
  	let theme = colorList[this.getRandomInt()]
  	let nextDay = days.indexOf(this.state.day);
  	
  	if(nextDay < 0) return;
  	else if(nextDay === days.length-1) nextDay = 0;
  	else nextDay++;
  	if(days[nextDay] === "All"){
		nextDay++;
	}
  	this.setState({
  		theme,
	    day : days[nextDay]
  	},function(){
  		this.props.router.push('/week/'+this.state.day);
  		this.getStore(this.state.day)
  	})
  }

  render() {
    const { loading, loadingMore, showLoadingMore, allFiles, day, theme } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { previewVisible, previewImage, fileList ,previewDetails, previewOutfitSelector } = this.state;
      
    return (
      <div >
      	<Layout className="layout">
        	<Header className="header">
        		<h1 className="title">Digital Wardrobe</h1>
        		<hr style={{borderColor : theme}} className="title-bar"/>
        	</Header>
        	<Content className="content">
        		<List
			        className="loadmore-list"
			        itemLayout="horizontal"
			        >
		          <List.Item actions={[
		          	<Tooltip placement="top" title={"Previous Day"}>
			        	<a><Icon type="left" onClick={()=>this.previousDay()} /></a>
			        </Tooltip>, 
			        <Tooltip placement="top" title={"Next Day"}>
			        	<a><Icon type="right" onClick={()=>this.nextDay()}/></a>
			        </Tooltip>	
			        ]}>
		            <List.Item.Meta
		              avatar={<Avatar style={{backgroundColor : theme ,verticalAlign: 'middle'}} size="large">{day.slice(0,2)}</Avatar>}
		              title={<a href="">{day}</a>}
		              description="Outfits"
		            />
		            <div>
		            	<Select
						    showSearch
						    style={{ width: 200 }}
						    placeholder="Select a day"
						    optionFilterProp="children"
						    onChange={this.handleDayChange}
						    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
						  >
						    {days.length > 0 && days.map(day => 
		              			<Option key={day} value={day}>{day}</Option>
		              		)}
						  </Select>
		            </div>
		          </List.Item>
		       		<div className="img-container"> 
				        <Row>
				        {fileList.length > 0 && fileList.map(outfit => 
				        	<Col key={outfit.uid} span={4}>
					        	<div key={outfit.uid} className="outfit-holder">
					        		<div className="outfit-image">
					        			<img className="image" src={outfit.url} />
					        			<span className="actions">
					        				<i className="anticon anticon-eye-o" 
					        				title="Preview file" 
					        				onClick={()=>{this.handlePreview(outfit)}}></i>
					        				<i className="anticon anticon-delete" 
					        				title="Remove file"
					        				onClick={()=>{this.handleRemove(outfit)}}></i>
					        			</span>
					        		</div>
					        		<div>
					        			<p className="image-holder-label">{outfit.label}</p>
					        		</div>
					        	</div>

							</Col>					        	
				        )}
				        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
						  <img alt="example" style={{ width: '100%' }} src={previewImage} />
						</Modal>
				        <Col span={4}>
				        	<div className="">
				        		<Button type="dashed" className="outfit-dashed-btn" onClick={this.openOutfitSelector}>
							    	<div className="ant-upload-text">
							    		<Icon type="plus" />
							    		<p>Add From Wardrobe</p>
							    	</div> 
							  	</Button>
				        	</div>
				        </Col>
				        </Row>
			        </div> 	
					<Modal 
					visible={previewOutfitSelector} 
					onCancel={this.handleOutfitSelectorCancel}
					onOk = {this.handleOutfitSelectorOk} >
						<Form layout="vertical">
					    <FormItem label="Assign to a day">
					      {getFieldDecorator('outfits')(
					      	<Checkbox.Group >
							    <Row>
							    	{allFiles && allFiles.length > 0 && allFiles.map(file => 
							    		<Col key={file.uid} span={12}>
							    			<Checkbox name="selectedOutfits" value={file.uid}>
							    				<div className="outfit-holder modal-outfit-holder">
									        		<div className="outfit-image">
									        			<img className="image" src={file.url} />
									        		</div>
									        	</div>
							    			</Checkbox>
							    		</Col>
							    	)}
							    </Row>
							  </Checkbox.Group>
					      	)}
					    </FormItem>
					</Form>
					</Modal>
			    </List>
        	</Content>
      	</Layout>
      </div>
    );
  }
}

const App = Form.create()(AppForm);

export default App;
