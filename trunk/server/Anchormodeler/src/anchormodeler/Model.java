package anchormodeler;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Email;

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

    @Persistent(nullValue=NullValue.NONE)
    private String keywords;
    
    @Persistent(nullValue=NullValue.NONE)
    private String email;

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
		this.keywords = keywords;
	}

	public String getKeywords() {
		return keywords;
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


}