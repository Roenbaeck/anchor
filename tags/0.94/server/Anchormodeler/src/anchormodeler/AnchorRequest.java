package anchormodeler;

import java.util.HashMap;

import org.apache.commons.fileupload.FileItemStream;

import com.google.appengine.api.users.User;

public class AnchorRequest {

	public HashMap<String,FileItemStream> fileParams = new HashMap<String,FileItemStream>(); 
	public HashMap<String,String> stringParams = new HashMap<String,String>(); 

	public User user;
	public String requireLoginMessage;
	public String logoutUrl;
	
}
