package anchormodeler;

import java.util.ArrayList;
import java.util.Date;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.NullValue;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable
public class Model {
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

    @Persistent
    private String modelName;

    @Persistent
    private Text modelXml;

    @Persistent(nullValue=NullValue.NONE)
    private Text icon;

    @Persistent
    private String userId;

    @Persistent(nullValue=NullValue.NONE)
    private boolean isPublic;

    //Deprecated, use keywordList instead
    @Persistent(nullValue=NullValue.NONE)
    private String keywords;
    
    @Persistent(nullValue=NullValue.NONE)
    private String email;

    @Persistent(nullValue=NullValue.NONE)
    private ArrayList<String> keywordList;
    
    @Persistent(nullValue=NullValue.NONE)
    private Text description;

    @Persistent(nullValue=NullValue.NONE)
    private Integer loadCount;

    @Persistent(nullValue=NullValue.NONE)
    private Date lastLoaded;

    public Key getKey() {
        return key;
    }

	public void setModelName(String modelName) {
		this.modelName = modelName;
	}

	public String getModelName() {
		return modelName;
	}

	public void setModelXml(Text modelXml) {
		this.modelXml = modelXml;
	}

	public Text getModelXml() {
		return modelXml;
	}

	public void setIcon(Text icon) {
		this.icon = icon;
	}

	public Text getIcon() {
		return icon;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getUserId() {
		return userId;
	}

	public void setKeywords(String keywords) {
		if(keywords==null)
			keywords="";
		keywords = keywords.toLowerCase();
		
		String[] list = keywords.split(" ");
		if(keywordList==null)
			keywordList=new ArrayList<String>();
		for(String s : list) {
			s=s.trim();
			if(!keywordList.contains(s))
				keywordList.add(s);
		}
		
		this.keywords = keywords;
	}

	public String getKeywords() {
		if((keywordList==null) || keywordList.isEmpty())
			return this.keywords;
		String result="";
		for(String s : keywordList)
			result += s + " ";
		return result;
	}

	public void setPublic(boolean isPublic) {
		this.isPublic = isPublic;
	}

	public boolean isPublic() {
		return isPublic;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getEmail() {
		return email;
	}

	public void setDescription(Text description) {
		this.description = description;
	}

	public Text getDescription() {
		return description;
	}

	public void setLastLoaded(Date lastLoaded) {
		this.lastLoaded = lastLoaded;
	}

	public Date getLastLoaded() {
		return lastLoaded;
	}

	public void setLoadCount(Integer loadCount) {
		this.loadCount = loadCount;
	}

	public Integer getLoadCount() {
		return (loadCount==null) ? new Integer(0) : loadCount;
	}


}