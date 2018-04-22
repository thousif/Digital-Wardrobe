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
    this.state =  {
	    theme : colorList[this.getRandomInt()],
	    day : 'All', 
	    previewVisible: false,
	    previewImage: '',
	    previewDetails : false,
	    previewOutfitSelector : false,
	    fileList: [],
	    file : {}
	}
  }

  getRandomInt = () => {
	  return Math.floor(Math.random() * Math.floor(9));
  }

  // function to retreive base64 of the uploaded image
  getBase64FromImageUrl = (file,cb) => {
    var fileReader = new FileReader();

    fileReader.onload=function(e) {
        var image = new Image();

        image.src = e.target.result;

        image.onload=function(){

        	// basic image optimization for storing big images
            var MAXWidthHeight = 800;
            var resolution = MAXWidthHeight/Math.max(this.width,this.height),

            width = Math.round(this.width*resolution),
            height = Math.round(this.height*resolution),
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            canvas.getContext("2d").drawImage(this,0,0,width,height);

            var dataUrl = canvas.toDataURL("image/jpeg",0.8);
            
            cb({
            	url : dataUrl,
            	uid : file.uid,
            	name : file.name
            });
        }
    }

	fileReader.readAsDataURL(file);
  }

  componentDidMount() {
    // lets start
    // check if there is an existing database and update state .
    let {day} = this.state;
    if(day === "All"){
		this.getStore()
		return;
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
	    var index = store.createIndex("days" , "days" , {unique : false,multiEntry : true});
	    store.createIndex("id","id",{ unique : true });
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
	    
	    var getAll = index.getAll();

	    console.log('check');
	   
	    getAll.onsuccess = function() {
	   		if(getAll.result && getAll.result.length >= 0){
	   			console.log('getAll', getAll);
	   			if(getAll.result && getAll.result.length >= 0){
		   			let fileList = getAll.result.map(data => data.uri);
		   			self.setState({
		   				...self.state,
		   				fileList
		   			})
		   		}
	   			// let allFiles = getAll.result.map(data)
	   		}
	    }

	    getAll.onerror = function() {
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

  handleOk = (e) => {
  	e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        let { file } = this.state;
        file.label = values.name;
        this.storeToDB(file,values.day);
        this.setState({
        	previewDetails : false,
        	file : {}
        })
        this.props.form.resetFields();
      }
    });
  }

  handleOutfitSelectorOk = (e) => {
  	e.preventDefault();
  	this.props.form.validateFields((err,values) => {
  		console.log(values);
  	})
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
	
	const open = indexedDB.open('myDatabase', 5);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("wardrobe5", {keyPath: "id"});
	    store.createIndex("id","id",{ unique : true });
	    store.createIndex("days" , "days" , {unique : false,multiEntry : true});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("wardrobe5", "readwrite");
	    var store = tx.objectStore("wardrobe5");
	    var index = store.index("days");

	    store.put({id: file.uid , uri : file , days : [day || self.state.day]});

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

  deleteFromDB = (file) => {
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
	   	store.createIndex("id","id",{unique : true})
	    store.createIndex("days" , "days" , {unique : false,multiEntry : true});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("wardrobe5", "readwrite");
	    var store = tx.objectStore("wardrobe5");
	    var index = store.index("id");

	    var getImage = store.delete(file.uid);

	    getImage.onsuccess = function() {
	    	console.log("deleted from db");
	    	message.success("Successfully deleted the image.")
	    };

	    getImage.onerror = function() {
	    	message.error("Error deleting the image.")
	    	console.log(getImage.error);
	    }

	    tx.oncomplete = function() {
	        db.close();
	    };
	}	
  }


  handleCancel = () => this.setState({ previewVisible: false })
  
  handleDetailsCancel = () => this.setState({ previewDetails: false })

  handleOutfitSelectorCancel = () => this.setState({ previewOutfitSelector : false })

  openOutfitSelector = () => this.setState({ previewOutfitSelector : true })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleDelete = (file) => {
  	let {fileList} = this.state;
  	fileList = fileList.filter(f => f.uid != file.uid);
  	this.deleteFromDB(file);
  	this.setState({fileList})
  }

  handleUpload = (file) => {
  	this.getBase64FromImageUrl(file.file,this.confirm)
  }

  handleChange = ({file, fileList }) => {
  	console.log(fileList);
  	if(file.status == "removed"){
  		this.deleteFromDB(file);
  	}
  	this.setState({ fileList })
  }

  handleDayChange = (day) => {
  	this.props.router.push('/week/'+day);
  	console.log(day);
  	// this.setState({day},function(){
  	// 	if(day === "All"){
  	// 		this.getStore()
  	// 		return;
  	// 	}
  	// 	this.getStore(day);
  	// })
  }

  previousDay = () => {
  	let theme = colorList[this.getRandomInt()]
  	let prevDay = days.indexOf(this.state.day);
  	
  	if(prevDay < 0) return;
  	else if(prevDay === 0) prevDay = days.length-1;
  	else prevDay--;
  	
  	this.setState({
  		theme,
	    day : days[prevDay]
  	},function(){
  		if(this.state.day === "All"){
  			this.getStore()
  			return;
  		}
  		this.getStore(this.state.day)
  	})
  }

  nextDay = () => {
  	let theme = colorList[this.getRandomInt()]
  	let nextDay = days.indexOf(this.state.day);
  	
  	if(nextDay < 0) return;
  	else if(nextDay === days.length-1) nextDay = 0;
  	else nextDay++;
  	
  	this.setState({
  		theme,
	    day : days[nextDay]
  	},function(){
  		if(this.state.day === "All"){
  			this.getStore()
  			return;
  		}
  		this.getStore(this.state.day)
  	})
  }

  render() {
    const { loading, loadingMore, showLoadingMore, day,theme } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const loadMore = showLoadingMore ? (
      <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
        {loadingMore && <Spin />}
        {!loadingMore && <Button onClick={this.onLoadMore}>loading more</Button>}
      </div>
    ) : null;
    console.log(this.state);
    const { previewVisible, previewImage, fileList ,previewDetails, previewOutfitSelector } = this.state;
    const uploadButton = ( (day === 'All') ? 
	 	<div >
        	<Icon type="plus" />
        	<div className="ant-upload-text">
        		Upload 
        	</div>
      	</div>
	: 
		<Button type="dashed" className="outfit-dashed-btn" onClick={this.openOutfitSelector}>
        	<div className="ant-upload-text">
        		<Icon type="plus" />
        		<p>Add From Wardrobe</p>
        	</div> 
      	</Button>
	)
      
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
		          	{day === "All" ? 
						<div className="img-container"> 
						<Upload
						  customRequest = {this.handleUpload}
						  listType="picture-card"
						  accept="image/*"
						  fileList={fileList}
						  onPreview={this.handlePreview}
						  onChange={this.handleChange}
						>
						  {uploadButton}
						</Upload>
						<Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
						  <img alt="example" style={{ width: '100%' }} src={previewImage} />
						</Modal>
						</div>
			        :
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
						        				onClick={()=>{this.handleDelete(outfit)}}></i>
						        			</span>
						        		</div>
						        	</div>
								</Col>					        	
					        )}
					        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
							  <img alt="example" style={{ width: '100%' }} src={previewImage} />
							</Modal>
					        <Col span={4}>
					        	<div className="">
					        		{uploadButton}
					        	</div>
					        </Col>
					        </Row>
				        </div> 	
		      	  	}
		          <Modal 
		          visible={previewDetails} 
		          onCancel={this.handleDetailsCancel}
		          onOk = {this.handleOk} >
		          	<Form layout="vertical">
			            <FormItem label="Name">
			              {getFieldDecorator('name', {
			                rules: [{ required: true, message: 'Please input the name for image !' }],
			              })(
			                <Input />
			              )}
			            </FormItem>
			            <FormItem label="Assign to a day">
			              {getFieldDecorator('day')(
			              	<Select placeholder = "Select a day for this cloth" >
			              		{days.length > 0 && days.map(day => 
			              			<Option key={day} value={day}>{day}</Option>
			              		)}
			              	</Select>
			              	)}
			            </FormItem>
			        </Form>
		          </Modal>
			    </List>
        	</Content>
        	{/*<Footer className="footer">Footer</Footer>*/}
      	</Layout>
      </div>
    );
  }
}

const App = Form.create()(AppForm);

export default App;
