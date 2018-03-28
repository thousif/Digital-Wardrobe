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
	notification } from 'antd'
import moment from 'moment'
import './index.css'
const { Header, Footer, Content } = Layout;
const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

class App extends Component {
  constructor(props){
    super(props);
    console.log(this.props);
    this.state =  {
	    loading: true,
	    loadingMore: false,
	    showLoadingMore: true,
	    data: [],
	    previewVisible: false,
	    previewImage: '',
	    fileList: [{
	      uid: -1,
	      name: 'xxx.png',
	      status: 'done',
	      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
	    }],
	}
  }

  getBase64FromImageUrl = (file,cb) => {
    var fileReader = new FileReader();

    fileReader.onload=function(e) {
        var image = new Image();

        image.src = e.target.result;

        image.onload=function(){

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
	
	console.log(file);

	fileReader.readAsDataURL(file);
    // img.src = url;
  }

  componentDidMount() {
    // this.getData((res) => {
    //   this.setState({
    //     loading: false,
    //     data: res.results,
    //   });
    // });

    this.setState({
    	...this.state,
    	loading : false,
    	date : moment().format('YYYYMMDD'),
    	data : [{
    		title : 'Today',
    		name : {
    			last : 'jay'
    		}
    	}]
    },function(){
    	this.getStore();
    })

    
	// this.getBase64FromImageUrl(this.state.fileList[0].url,this.storeToDB)

  }

  getStore = () => {
  	console.log("fetching all stored images");
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    return;
	}

	const self = this;

	const open = indexedDB.open('myDatabase', 1 ,function(upgrade){
		console.log("upgrade",upgrade);
	});

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
	    var index = store.createIndex("date" , "date" , {unique : false});
	};

  	open.onerror = (err) => {
  		console.log(err);
  	}

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("MyObjectStore", "readwrite");
	    var store = tx.objectStore("MyObjectStore");
	    var index = store.index("date");

	    // Query the data
	    var getAll = index.getAll(self.state.date);
	    
	    getAll.onsuccess = function() {
	    	console.log(getAll);
	   		if(getAll.result && getAll.result.length > 0){
	   			let fileList = getAll.result.map(data => data.uri);
	   			self.setState({
	   				...self.state,
	   				fileList
	   			})
	   		}
	    };

	    tx.oncomplete = function() {
	        db.close();
	    };
	}		
  }

  storeToDB = (file) => {
  	if (!('indexedDB' in window)) {
	    console.log('This browser doesn\'t support IndexedDB');
	    return;
	}

	const self = this;

	file = {
		...file,
		status : 'done'
	}
	
	const open = indexedDB.open('myDatabase', 1);

	open.onupgradeneeded = function() {
	    var db = open.result;
	    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
	    var index = store.createIndex("date" , "date" , {unique : false});
	};

  	open.onsuccess = () => {
	    var db = open.result;
	    var tx = db.transaction("MyObjectStore", "readwrite");
	    var store = tx.objectStore("MyObjectStore");
	    var index = store.index("date");

	    store.put({id: file.uid , uri : file , date : self.date});

	    var getImage = index.get(file.uid);

	    getImage.onsuccess = function() {
	    	
	    	let {fileList} = self.state;

			let target = fileList.findIndex(f => f.uid == file.uid);

			if(target > 0){
				fileList[target] = file;

				self.setState({
					...this.state,
					fileList
				})
			} else {
				console.log("Invalid id, file not found");
			}

	    };

	    // Close the db when the transaction is done
	    tx.oncomplete = function() {
	        db.close();
	    };
	}		
  }

  getData = (callback) => {
    reqwest({
      url: fakeDataUrl,
      type: 'json',
      method: 'get',
      contentType: 'application/json',
      success: (res) => {
        callback(res);
      },
    });
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleUpload = (file) => {
  	console.log(file);
  	this.getBase64FromImageUrl(file.file,this.storeToDB)
  }

  handleChange = ({ fileList }) => {
  	console.log(fileList);
  	this.setState({ fileList })
  }

  render() {
    const { loading, loadingMore, showLoadingMore, data } = this.state;
    const loadMore = showLoadingMore ? (
      <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
        {loadingMore && <Spin />}
        {!loadingMore && <Button onClick={this.onLoadMore}>loading more</Button>}
      </div>
    ) : null;
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div >
      	<Layout className="layout">
        	<Header className="header">
        		<h1 className="title">Ward robe</h1>
        		<hr className="title-bar"/>
        	</Header>
        	<Content className="content">
        		<List
			        className="loadmore-list"
			        loading={loading}
			        itemLayout="horizontal"
			        loadMore={loadMore}
			        dataSource={data}
			        renderItem={(item,index) => (
			          <div>
				          <List.Item actions={[<a>edit</a>, <a>more</a>]}>
				            <List.Item.Meta
				              avatar={<Avatar style={{backgroundColor : colorList[index] ,verticalAlign: 'middle'}} size="large">{item.title.slice(0,1)}</Avatar>}
				              title={<a href="https://ant.design">{item.title}</a>}
				              description={moment().format("MMM Do YY")}
				            />
				            <div>content</div>
				          </List.Item>
				          <div className="img-container"> 
					        <Upload
					          customRequest = {this.handleUpload}
					          listType="picture-card"
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
			          </div>
			        )}
			    />
        	</Content>
        	<Footer className="footer">Footer</Footer>
      	</Layout>
      </div>
    );
  }
}

export default App;
